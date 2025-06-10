// Onramp.money whitelabel configuration for Stellar-based remittances
const ONRAMP_API_BASE = 'https://api.onramp.money';
const ONRAMP_API_KEY = import.meta.env.VITE_ONRAMP_API_KEY || 'demo_key';

// Stellar network configuration (using Onramp's infrastructure)
const isTestnet = import.meta.env.VITE_STELLAR_NETWORK === 'testnet';

// Supported stablecoins on Stellar (via Onramp.money)
export const STELLAR_ASSETS = {
  USDC: 'USDC',
  EURC: 'EURC', 
  XLM: 'XLM',
  INR: 'INR', // Fiat-to-stablecoin via Onramp
  NGN: 'NGN', // Fiat-to-stablecoin via Onramp
  EUR: 'EUR', // Fiat-to-stablecoin via Onramp
  USD: 'USD', // Fiat-to-stablecoin via Onramp
};

export interface StellarWallet {
  publicKey: string;
  secretKey: string;
}

export interface StellarTransaction {
  id: string;
  from: string;
  to: string;
  asset: Asset;
  amount: string;
  memo?: string;
  timestamp: Date;
}

export class StellarService {
  /**
   * Generate a new Stellar keypair for wallet creation
   */
  static generateKeypair(): StellarWallet {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  /**
   * Get account balance for a specific asset
   */
  static async getBalance(publicKey: string, asset: Asset): Promise<string> {
    try {
      const account = await server.loadAccount(publicKey);
      
      if (asset.isNative()) {
        return account.balances.find(balance => balance.asset_type === 'native')?.balance || '0';
      }
      
      const balance = account.balances.find(balance => 
        balance.asset_type !== 'native' &&
        balance.asset_code === asset.getCode() &&
        balance.asset_issuer === asset.getIssuer()
      );
      
      return balance?.balance || '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  /**
   * Get all balances for an account
   */
  static async getAllBalances(publicKey: string): Promise<{ [key: string]: string }> {
    try {
      const account = await server.loadAccount(publicKey);
      const balances: { [key: string]: string } = {};
      
      for (const balance of account.balances) {
        if (balance.asset_type === 'native') {
          balances['XLM'] = balance.balance;
        } else if (balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12') {
          const key = `${balance.asset_code}`;
          balances[key] = balance.balance;
        }
      }
      
      return balances;
    } catch (error) {
      console.error('Error fetching all balances:', error);
      return {};
    }
  }

  /**
   * Create and submit a payment transaction
   */
  static async sendPayment(
    senderSecretKey: string,
    recipientPublicKey: string,
    asset: Asset,
    amount: string,
    memo?: string
  ): Promise<string> {
    try {
      const senderKeypair = Keypair.fromSecret(senderSecretKey);
      const senderAccount = await server.loadAccount(senderKeypair.publicKey());
      
      const transaction = new TransactionBuilder(senderAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: recipientPublicKey,
            asset: asset,
            amount: amount,
          })
        )
        .setTimeout(300);

      if (memo) {
        transaction.addMemo(Horizon.Memo.text(memo));
      }

      const builtTransaction = transaction.build();
      builtTransaction.sign(senderKeypair);
      
      const result = await server.submitTransaction(builtTransaction);
      return result.hash;
    } catch (error) {
      console.error('Error sending payment:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create trustline for an asset (required to hold stablecoins)
   */
  static async createTrustline(
    accountSecretKey: string,
    asset: Asset
  ): Promise<string> {
    try {
      const keypair = Keypair.fromSecret(accountSecretKey);
      const account = await server.loadAccount(keypair.publicKey());
      
      const transaction = new TransactionBuilder(account, {
        fee: await server.fetchBaseFee(),
        networkPassphrase,
      })
        .addOperation(
          Operation.changeTrust({
            asset: asset,
          })
        )
        .setTimeout(300)
        .build();

      transaction.sign(keypair);
      
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error('Error creating trustline:', error);
      throw new Error(`Trustline creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history for an account
   */
  static async getTransactionHistory(publicKey: string): Promise<StellarTransaction[]> {
    try {
      const payments = await server
        .payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(50)
        .call();

      return payments.records
        .filter(payment => payment.type === 'payment')
        .map(payment => {
          const paymentRecord = payment as Horizon.PaymentOperationRecord;
          return {
            id: paymentRecord.transaction_hash,
            from: paymentRecord.from,
            to: paymentRecord.to,
            asset: paymentRecord.asset_type === 'native' 
              ? Asset.native() 
              : new Asset(paymentRecord.asset_code!, paymentRecord.asset_issuer!),
            amount: paymentRecord.amount,
            timestamp: new Date(paymentRecord.created_at),
          };
        });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Fund account with testnet XLM (testnet only)
   */
  static async fundTestnetAccount(publicKey: string): Promise<boolean> {
    if (!isTestnet) {
      throw new Error('Account funding only available on testnet');
    }

    try {
      const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
      return response.ok;
    } catch (error) {
      console.error('Error funding testnet account:', error);
      return false;
    }
  }

  /**
   * Check if account exists on Stellar network
   */
  static async accountExists(publicKey: string): Promise<boolean> {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert between different stablecoins using Stellar DEX
   */
  static async pathPayment(
    senderSecretKey: string,
    recipientPublicKey: string,
    sendAsset: Asset,
    sendAmount: string,
    destAsset: Asset,
    destMin: string
  ): Promise<string> {
    try {
      const senderKeypair = Keypair.fromSecret(senderSecretKey);
      const senderAccount = await server.loadAccount(senderKeypair.publicKey());
      
      // Find payment path
      const pathBuilder = await server
        .strictSendPaths(sendAsset, sendAmount, [destAsset])
        .call();

      if (pathBuilder.records.length === 0) {
        throw new Error('No payment path found');
      }

      const path = pathBuilder.records[0];
      
      const transaction = new TransactionBuilder(senderAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase,
      })
        .addOperation(
          Operation.pathPaymentStrictSend({
            sendAsset: sendAsset,
            sendAmount: sendAmount,
            destination: recipientPublicKey,
            destAsset: destAsset,
            destMin: destMin,
            path: path.path,
          })
        )
        .setTimeout(300)
        .build();

      transaction.sign(senderKeypair);
      
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error('Error executing path payment:', error);
      throw new Error(`Path payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default StellarService;