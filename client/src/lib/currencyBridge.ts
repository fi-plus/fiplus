import { onrampWhitelabel } from "./onramp";
import { walletService } from "./walletService";
import { transactionService } from "./transactionService";
import { SUPPORTED_CURRENCIES } from "./constants";

export interface BridgeQuote {
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  bridgeAmount?: number; // XLM amount if using bridge
  exchangeRate: number;
  fees: {
    onrampFee?: number;
    offrampFee?: number;
    bridgeFee?: number;
    total: number;
  };
  route: 'direct' | 'bridge';
  steps: string[];
  estimatedTime: string;
}

export interface BridgeTransaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  route: 'direct' | 'bridge';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  steps: {
    step: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  }[];
  createdAt: Date;
  completedAt?: Date;
}

class CurrencyBridgeService {
  private transactions: Map<string, BridgeTransaction> = new Map();

  /**
   * Get quote for currency conversion using XLM bridge when needed
   */
  async getConversionQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    fromAsset?: 'XLM' | 'USDC' | 'USDT'
  ): Promise<BridgeQuote> {
    // If both currencies are the same, return 1:1 conversion
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount: amount,
        exchangeRate: 1,
        fees: { total: 0 },
        route: 'direct',
        steps: ['Direct transfer'],
        estimatedTime: 'Instant'
      };
    }

    // Check if direct conversion is possible (both supported by Onramp)
    const fromSupported = this.isOnrampSupported(fromCurrency);
    const toSupported = this.isOnrampSupported(toCurrency);

    if (fromSupported && toSupported && fromCurrency !== 'XLM' && toCurrency !== 'XLM') {
      // Use XLM bridge for fiat-to-fiat conversion
      return this.getBridgeQuote(fromCurrency, toCurrency, amount, fromAsset);
    }

    // Direct conversion scenarios
    if (fromCurrency === 'XLM' && toSupported) {
      // XLM to fiat (offramp)
      return this.getOfframpQuote('XLM', toCurrency, amount);
    }

    if (fromSupported && toCurrency === 'XLM') {
      // Fiat to XLM (onramp)
      return this.getOnrampQuote(fromCurrency, 'XLM', amount);
    }

    throw new Error(`Conversion from ${fromCurrency} to ${toCurrency} not supported`);
  }

  /**
   * Get bridge quote using XLM as intermediate currency
   */
  private async getBridgeQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    fromAsset?: 'XLM' | 'USDC' | 'USDT'
  ): Promise<BridgeQuote> {
    // Step 1: Convert fiat/asset to XLM
    let onrampQuote;
    if (fromAsset && ['USDC', 'USDT', 'XLM'].includes(fromAsset)) {
      // Convert crypto asset to XLM first if needed
      if (fromAsset === 'XLM') {
        onrampQuote = {
          cryptoAmount: amount,
          exchangeRate: 1,
          fees: { total: 0 },
          estimatedTime: 'Instant'
        };
      } else {
        // Asset swap to XLM (simplified for now)
        const xlmRate = fromAsset === 'USDC' ? 7.2 : 7.1; // USDT slightly different rate
        onrampQuote = {
          cryptoAmount: amount * xlmRate,
          exchangeRate: xlmRate,
          fees: { total: amount * 0.003 }, // 0.3% swap fee
          estimatedTime: '30 seconds'
        };
      }
    } else {
      onrampQuote = await onrampWhitelabel.getOnrampQuote({
        fiatCurrency: fromCurrency,
        fiatAmount: amount,
        cryptoCurrency: 'XLM',
        paymentMethod: 'bank_transfer'
      });
    }

    // Step 2: Convert XLM to target fiat
    const offrampQuote = await onrampWhitelabel.getOfframpQuote({
      cryptoCurrency: 'XLM',
      cryptoAmount: onrampQuote.cryptoAmount,
      fiatCurrency: toCurrency,
      paymentMethod: 'bank_transfer'
    });

    const totalFees = (onrampQuote.fees.total || 0) + (offrampQuote.fees.total || 0);
    const overallRate = offrampQuote.fiatAmount / amount;

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: offrampQuote.fiatAmount,
      bridgeAmount: onrampQuote.cryptoAmount,
      exchangeRate: overallRate,
      fees: {
        onrampFee: onrampQuote.fees.total || 0,
        offrampFee: offrampQuote.fees.total || 0,
        total: totalFees
      },
      route: 'bridge',
      steps: [
        `Convert ${amount} ${fromCurrency} to ${onrampQuote.cryptoAmount.toFixed(2)} XLM`,
        `Convert ${onrampQuote.cryptoAmount.toFixed(2)} XLM to ${offrampQuote.fiatAmount.toFixed(2)} ${toCurrency}`
      ],
      estimatedTime: '10-20 minutes'
    };
  }

  /**
   * Get direct onramp quote
   */
  private async getOnrampQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<BridgeQuote> {
    const quote = await onrampWhitelabel.getOnrampQuote({
      fiatCurrency: fromCurrency,
      fiatAmount: amount,
      cryptoCurrency: toCurrency,
      paymentMethod: 'bank_transfer'
    });

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: quote.cryptoAmount,
      exchangeRate: quote.exchangeRate,
      fees: {
        onrampFee: quote.fees.total,
        total: quote.fees.total
      },
      route: 'direct',
      steps: [`Convert ${amount} ${fromCurrency} to ${quote.cryptoAmount.toFixed(2)} ${toCurrency}`],
      estimatedTime: quote.estimatedTime
    };
  }

  /**
   * Get direct offramp quote
   */
  private async getOfframpQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: number
  ): Promise<BridgeQuote> {
    const quote = await onrampWhitelabel.getOfframpQuote({
      cryptoCurrency: fromCurrency,
      cryptoAmount: amount,
      fiatCurrency: toCurrency,
      paymentMethod: 'bank_transfer'
    });

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: quote.fiatAmount,
      exchangeRate: quote.exchangeRate,
      fees: {
        offrampFee: quote.fees.total,
        total: quote.fees.total
      },
      route: 'direct',
      steps: [`Convert ${amount} ${fromCurrency} to ${quote.fiatAmount.toFixed(2)} ${toCurrency}`],
      estimatedTime: quote.estimatedTime
    };
  }

  /**
   * Execute currency conversion
   */
  async executeConversion(
    quote: BridgeQuote,
    userEmail: string,
    bankDetails?: any
  ): Promise<BridgeTransaction> {
    const transactionId = `bridge_${Date.now()}`;
    
    const bridgeTransaction: BridgeTransaction = {
      id: transactionId,
      fromCurrency: quote.fromCurrency,
      toCurrency: quote.toCurrency,
      fromAmount: quote.fromAmount,
      toAmount: quote.toAmount,
      route: quote.route,
      status: 'pending',
      steps: quote.steps.map(step => ({ step, status: 'pending' })),
      createdAt: new Date()
    };

    this.transactions.set(transactionId, bridgeTransaction);

    try {
      if (quote.route === 'direct') {
        // Execute direct conversion
        await this.executeDirectConversion(bridgeTransaction, userEmail, bankDetails);
      } else {
        // Execute bridge conversion
        await this.executeBridgeConversion(bridgeTransaction, userEmail, bankDetails);
      }
    } catch (error) {
      bridgeTransaction.status = 'failed';
      this.transactions.set(transactionId, bridgeTransaction);
      throw error;
    }

    return bridgeTransaction;
  }

  /**
   * Execute direct conversion (single step)
   */
  private async executeDirectConversion(
    transaction: BridgeTransaction,
    userEmail: string,
    bankDetails?: any
  ): Promise<void> {
    transaction.status = 'processing';
    transaction.steps[0].status = 'pending';

    if (transaction.fromCurrency === 'XLM') {
      // Offramp: XLM to fiat
      const offrampTx = await onrampWhitelabel.createOfframpTransaction({
        cryptoCurrency: transaction.fromCurrency,
        cryptoAmount: transaction.fromAmount,
        fiatCurrency: transaction.toCurrency,
        fiatAmount: transaction.toAmount,
        walletAddress: 'GCEXAMPLE_STELLAR_WALLET',
        userEmail,
        bankDetails: bankDetails || {},
        paymentMethod: 'bank_transfer'
      });

      transaction.steps[0].transactionId = offrampTx.transactionId;
      transaction.steps[0].status = 'completed';
    } else {
      // Onramp: fiat to XLM using real API
      const kycResult = await onrampWhitelabel.createKycUrl({
        userEmail,
        clientCustomerId: `bridge-${transaction.id}`
      });
      
      const quote = await onrampWhitelabel.getOnrampQuote({
        fiatCurrency: transaction.fromCurrency,
        fiatAmount: transaction.fromAmount,
        cryptoCurrency: transaction.toCurrency
      });
      
      const onrampTx = await onrampWhitelabel.createOnrampTransaction({
        customerId: kycResult.customerId,
        clientCustomerId: kycResult.clientCustomerId,
        depositAddress: 'STELLAR_WALLET_ADDRESS',
        fiatCurrency: transaction.fromCurrency,
        cryptoCurrency: transaction.toCurrency,
        fiatAmount: transaction.fromAmount,
        cryptoAmount: quote.cryptoAmount,
        rate: quote.exchangeRate
      });

      transaction.steps[0].transactionId = onrampTx.sessionId;
      transaction.steps[0].status = 'completed';
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date();
  }

  /**
   * Execute bridge conversion (two steps via XLM)
   */
  private async executeBridgeConversion(
    transaction: BridgeTransaction,
    userEmail: string,
    bankDetails?: any
  ): Promise<void> {
    transaction.status = 'processing';

    // Step 1: Convert to XLM
    transaction.steps[0].status = 'pending';
    const onrampTx = await onrampWhitelabel.createOnrampSession({
      fiatCurrency: transaction.fromCurrency,
      fiatAmount: transaction.fromAmount,
      cryptoCurrency: 'XLM',
      walletAddress: 'GCEXAMPLE_STELLAR_WALLET',
      userEmail,
      paymentMethod: 'bank_transfer'
    });

    transaction.steps[0].transactionId = onrampTx.sessionId;
    transaction.steps[0].status = 'completed';

    // Step 2: Convert XLM to target currency
    transaction.steps[1].status = 'pending';
    const offrampTx = await onrampWhitelabel.createOfframpTransaction({
      cryptoCurrency: 'XLM',
      cryptoAmount: transaction.fromAmount, // This should be the XLM amount from step 1
      fiatCurrency: transaction.toCurrency,
      fiatAmount: transaction.toAmount,
      walletAddress: 'GCEXAMPLE_STELLAR_WALLET',
      userEmail,
      bankDetails: bankDetails || {},
      paymentMethod: 'bank_transfer'
    });

    transaction.steps[1].transactionId = offrampTx.transactionId;
    transaction.steps[1].status = 'completed';

    transaction.status = 'completed';
    transaction.completedAt = new Date();
  }

  /**
   * Get transaction status
   */
  getTransaction(transactionId: string): BridgeTransaction | undefined {
    return this.transactions.get(transactionId);
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): BridgeTransaction[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Check if currency is supported by Onramp
   */
  private isOnrampSupported(currency: string): boolean {
    const onrampCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES', 'XLM'];
    return onrampCurrencies.includes(currency);
  }

  /**
   * Get supported currency pairs
   */
  getSupportedPairs(): Array<{ from: string; to: string; route: 'direct' | 'bridge' }> {
    const pairs: Array<{ from: string; to: string; route: 'direct' | 'bridge' }> = [];
    const onrampCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES'];
    const cryptoAssets = ['XLM', 'USDC', 'USDT'];

    // Fiat to XLM (direct onramp)
    onrampCurrencies.forEach(fiat => {
      pairs.push({ from: fiat, to: 'XLM', route: 'direct' });
      pairs.push({ from: 'XLM', to: fiat, route: 'direct' });
    });

    // Fiat to fiat via XLM bridge
    onrampCurrencies.forEach(fromFiat => {
      onrampCurrencies.forEach(toFiat => {
        if (fromFiat !== toFiat) {
          pairs.push({ from: fromFiat, to: toFiat, route: 'bridge' });
        }
      });
    });

    // Crypto assets to fiat (via XLM bridge if needed)
    cryptoAssets.forEach(asset => {
      onrampCurrencies.forEach(fiat => {
        pairs.push({ from: asset, to: fiat, route: asset === 'XLM' ? 'direct' : 'bridge' });
        pairs.push({ from: fiat, to: asset, route: asset === 'XLM' ? 'direct' : 'bridge' });
      });
    });

    return pairs;
  }
}

export const currencyBridge = new CurrencyBridgeService();