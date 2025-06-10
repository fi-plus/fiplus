import { 
  Networks, 
  Keypair, 
  Asset, 
  TransactionBuilder, 
  Operation,
  BASE_FEE,
  Memo,
  Horizon
} from '@stellar/stellar-sdk';

// Stellar network configuration from environment
const STELLAR_NETWORK = import.meta.env.VITE_STELLAR_NETWORK || 'TESTNET';
const HORIZON_URL = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = import.meta.env.VITE_STELLAR_FRIENDBOT_URL || 'https://friendbot.stellar.org';

// Initialize Stellar server
const server = new Horizon.Server(HORIZON_URL);
const networkPassphrase = STELLAR_NETWORK === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC;

export interface StellarAccount {
  publicKey: string;
  balances: Array<{
    asset_type: string;
    asset_code?: string;
    balance: string;
  }>;
  sequence: string;
}

export interface StellarTransaction {
  id: string;
  hash: string;
  successful: boolean;
  created_at: string;
  fee_charged: string;
  operations: any[];
}

export class StellarService {
  /**
   * Create new Stellar keypair for user wallet
   */
  createKeypair(): { publicKey: string; secretKey: string } {
    const keypair = Keypair.random();
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret()
    };
  }

  /**
   * Fund account using friendbot (testnet only)
   */
  async fundAccount(publicKey: string): Promise<boolean> {
    if (STELLAR_NETWORK !== 'TESTNET') {
      throw new Error('Friendbot funding only available on testnet');
    }

    try {
      const response = await fetch(`${FRIENDBOT_URL}?addr=${publicKey}`);
      return response.ok;
    } catch (error) {
      console.error('Friendbot funding failed:', error);
      return false;
    }
  }

  /**
   * Get account information from Stellar network
   */
  async getAccount(publicKey: string): Promise<StellarAccount> {
    try {
      const account = await server.loadAccount(publicKey);
      return {
        publicKey: account.accountId(),
        balances: account.balances,
        sequence: account.sequenceNumber()
      };
    } catch (error) {
      throw new Error(`Failed to load account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account balance for specific asset
   */
  async getBalance(publicKey: string, assetCode?: string): Promise<string> {
    try {
      const account = await this.getAccount(publicKey);
      
      if (!assetCode || assetCode === 'XLM') {
        const xlmBalance = account.balances.find(b => b.asset_type === 'native');
        return xlmBalance ? xlmBalance.balance : '0';
      }

      const assetBalance = account.balances.find(
        b => b.asset_code === assetCode && b.asset_type !== 'native'
      );
      return assetBalance ? assetBalance.balance : '0';
    } catch (error) {
      return '0';
    }
  }

  /**
   * Create trustline for stablecoin assets
   */
  async createTrustline(
    sourceSecretKey: string,
    assetCode: string,
    issuerPublicKey: string
  ): Promise<string> {
    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
      const account = await server.loadAccount(sourceKeypair.publicKey());
      
      const asset = new Asset(assetCode, issuerPublicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase
      })
        .addOperation(Operation.changeTrust({
          asset: asset,
          limit: '1000000' // Max trustline limit
        }))
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      throw new Error(`Trustline creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send payment on Stellar network
   */
  async sendPayment(
    sourceSecretKey: string,
    destinationPublicKey: string,
    amount: string,
    assetCode?: string,
    assetIssuer?: string,
    memo?: string
  ): Promise<string> {
    try {
      const sourceKeypair = Keypair.fromSecret(sourceSecretKey);
      const account = await server.loadAccount(sourceKeypair.publicKey());
      
      const asset = assetCode && assetIssuer 
        ? new Asset(assetCode, assetIssuer)
        : Asset.native();

      const transactionBuilder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase
      })
        .addOperation(Operation.payment({
          destination: destinationPublicKey,
          asset: asset,
          amount: amount
        }))
        .setTimeout(30);

      if (memo) {
        transactionBuilder.addMemo(Memo.text(memo));
      }

      const transaction = transactionBuilder.build();
      transaction.sign(sourceKeypair);
      
      const result = await server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history for account
   */
  async getTransactionHistory(publicKey: string): Promise<StellarTransaction[]> {
    try {
      const transactions = await server
        .transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(20)
        .call();

      return transactions.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        successful: tx.successful,
        created_at: tx.created_at,
        fee_charged: tx.fee_charged.toString(),
        operations: tx.operations || []
      }));
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      return [];
    }
  }

  /**
   * Get current network fee
   */
  async getNetworkFee(): Promise<string> {
    try {
      const feeStats = await server.feeStats();
      return feeStats.last_ledger_base_fee || BASE_FEE;
    } catch (error) {
      return BASE_FEE;
    }
  }

  /**
   * Check if account exists on network
   */
  async accountExists(publicKey: string): Promise<boolean> {
    try {
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const stellarService = new StellarService();