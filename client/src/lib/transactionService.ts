import { walletService } from "./walletService";
import { getExchangeRate, calculateFee, SUPPORTED_CURRENCIES } from "./constants";

export interface TransactionRecord {
  id: string;
  type: 'send' | 'receive' | 'deposit' | 'withdrawal' | 'convert';
  amount: number;
  currency: string;
  toCurrency?: string;
  convertedAmount?: number;
  recipientName?: string;
  recipientContact?: string;
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  deliveryMethod?: string;
  paymentMethod?: string;
}

class TransactionService {
  private transactions: TransactionRecord[] = [];

  generateTransactionId(): string {
    return 'FP' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  addMoney(currency: string, amount: number, paymentMethod: string): TransactionRecord {
    const fee = calculateFee(amount, 'deposit', paymentMethod);
    const netAmount = amount - fee;
    
    // Convert to appropriate stablecoin
    const stablecoin = this.getStablecoinForCurrency(currency);
    walletService.addFunds(stablecoin, netAmount);

    const transaction: TransactionRecord = {
      id: this.generateTransactionId(),
      type: 'deposit',
      amount,
      currency,
      fee,
      status: 'completed',
      timestamp: new Date(),
      paymentMethod
    };

    this.transactions.unshift(transaction);
    return transaction;
  }

  sendMoney(
    fromCurrency: string, 
    toCurrency: string, 
    amount: number, 
    recipientName: string, 
    recipientContact: string,
    deliveryMethod: string
  ): TransactionRecord {
    const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;
    const fee = calculateFee(amount, 'stellar');
    
    // Deduct from sender's balance
    const fromStablecoin = this.getStablecoinForCurrency(fromCurrency);
    const success = walletService.deductFunds(fromStablecoin, amount);

    const transaction: TransactionRecord = {
      id: this.generateTransactionId(),
      type: 'send',
      amount,
      currency: fromCurrency,
      toCurrency,
      convertedAmount,
      recipientName,
      recipientContact,
      fee,
      status: success ? 'completed' : 'failed',
      timestamp: new Date(),
      deliveryMethod
    };

    this.transactions.unshift(transaction);
    return transaction;
  }

  cashOut(
    asset: string, 
    currency: string, 
    amount: number, 
    method: string
  ): TransactionRecord {
    const fee = calculateFee(amount, 'withdrawal', method);
    const netAmount = amount - fee;
    
    const success = walletService.deductFunds(asset, amount);

    const transaction: TransactionRecord = {
      id: this.generateTransactionId(),
      type: 'withdrawal',
      amount: netAmount,
      currency,
      fee,
      status: success ? 'completed' : 'failed',
      timestamp: new Date(),
      paymentMethod: method
    };

    this.transactions.unshift(transaction);
    return transaction;
  }

  getTransactionHistory(): TransactionRecord[] {
    return [...this.transactions];
  }

  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  private getStablecoinForCurrency(currency: string): string {
    const supportedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    return supportedCurrency?.stablecoin || 'USDC';
  }
}

export const transactionService = new TransactionService();