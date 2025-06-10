// fi.plus Onramp.money Whitelabel Integration with Stellar Blockchain
// Implements SEP-24/SEP-31 standards and USDC/EURC stablecoin transfers

export interface OnrampStellarConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  stellarNetwork: 'testnet' | 'mainnet';
}

export interface StellarWallet {
  publicKey: string;
  balance: { [currency: string]: string };
  trustlines: string[];
}

export interface StellarTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  asset: string;
  amount: string;
  fee: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  memo?: string;
}

export interface OnrampPaymentRequest {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  recipientAddress: string;
  recipientName: string;
  paymentMethod: 'bank_transfer' | 'debit_card' | 'crypto_wallet';
}

export interface OnrampPaymentResponse {
  transactionId: string;
  stellarTxHash: string;
  status: string;
  estimatedSettlement: string;
  fees: {
    onrampFee: number;
    stellarFee: number;
    totalFee: number;
  };
}

export class OnrampStellarService {
  private config: OnrampStellarConfig;
  private apiBaseUrl: string;

  constructor(config: OnrampStellarConfig) {
    this.config = config;
    this.apiBaseUrl = config.environment === 'production' 
      ? 'https://api.onramp.money' 
      : 'https://sandbox-api.onramp.money';
  }

  /**
   * Initialize KYC process for user (SEP-12 compliance)
   */
  async initializeKYC(userId: string, userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  }): Promise<{ kycId: string; status: string; redirectUrl?: string }> {
    const response = await this.apiCall('/kyc/initialize', 'POST', {
      userId,
      ...userInfo,
      stellarNetwork: this.config.stellarNetwork
    });
    
    return response;
  }

  /**
   * Create Stellar wallet with stablecoin trustlines
   */
  async createStellarWallet(userId: string): Promise<StellarWallet> {
    const response = await this.apiCall('/stellar/wallet/create', 'POST', {
      userId,
      network: this.config.stellarNetwork,
      assets: ['USDC', 'EURC', 'XLM'], // Trustlines for stablecoins
    });

    return {
      publicKey: response.publicKey,
      balance: response.balances || {},
      trustlines: response.trustlines || []
    };
  }

  /**
   * Get wallet balances (all supported assets)
   */
  async getWalletBalances(publicKey: string): Promise<{ [currency: string]: string }> {
    const response = await this.apiCall('/stellar/wallet/balances', 'GET', {
      publicKey,
      network: this.config.stellarNetwork
    });

    return response.balances;
  }

  /**
   * Execute cross-border payment using Stellar network
   * Implements SEP-31 (Direct Payment) standard
   */
  async sendCrossBorderPayment(paymentRequest: OnrampPaymentRequest): Promise<OnrampPaymentResponse> {
    // Step 1: Convert fiat to stablecoin (if needed)
    const stablecoinAsset = this.mapCurrencyToStablecoin(paymentRequest.toCurrency);
    
    // Step 2: Execute Stellar payment
    const response = await this.apiCall('/stellar/payment/send', 'POST', {
      ...paymentRequest,
      stellarAsset: stablecoinAsset,
      network: this.config.stellarNetwork,
      protocol: 'SEP-31' // Direct payment standard
    });

    return {
      transactionId: response.transactionId,
      stellarTxHash: response.stellarHash,
      status: response.status,
      estimatedSettlement: response.settlement,
      fees: response.fees
    };
  }

  /**
   * Deposit fiat to Stellar stablecoin (SEP-24 implementation)
   */
  async depositFiatToStablecoin(
    userId: string,
    fiatCurrency: string,
    amount: number,
    paymentMethod: string
  ): Promise<{
    depositId: string;
    stellarAddress: string;
    memo: string;
    instructions: string;
  }> {
    const response = await this.apiCall('/stellar/deposit', 'POST', {
      userId,
      currency: fiatCurrency,
      amount,
      paymentMethod,
      protocol: 'SEP-24',
      network: this.config.stellarNetwork
    });

    return response;
  }

  /**
   * Withdraw stablecoin to fiat (SEP-24 implementation)
   */
  async withdrawStablecoinToFiat(
    userId: string,
    stablecoin: string,
    amount: number,
    destinationCurrency: string,
    bankDetails: any
  ): Promise<{
    withdrawalId: string;
    stellarTxRequired: boolean;
    instructions: string;
  }> {
    const response = await this.apiCall('/stellar/withdraw', 'POST', {
      userId,
      asset: stablecoin,
      amount,
      destinationCurrency,
      bankDetails,
      protocol: 'SEP-24',
      network: this.config.stellarNetwork
    });

    return response;
  }

  /**
   * Currency conversion using Stellar DEX
   */
  async convertCurrency(
    userId: string,
    fromAsset: string,
    toAsset: string,
    amount: number
  ): Promise<{
    conversionId: string;
    stellarTxHash: string;
    exchangeRate: number;
    receivedAmount: number;
  }> {
    const response = await this.apiCall('/stellar/convert', 'POST', {
      userId,
      fromAsset,
      toAsset,
      amount,
      network: this.config.stellarNetwork
    });

    return response;
  }

  /**
   * Get transaction history from Stellar network
   */
  async getTransactionHistory(publicKey: string): Promise<StellarTransaction[]> {
    const response = await this.apiCall('/stellar/transactions', 'GET', {
      publicKey,
      network: this.config.stellarNetwork,
      limit: 50
    });

    return response.transactions.map((tx: any) => ({
      id: tx.id,
      hash: tx.stellarHash,
      from: tx.from,
      to: tx.to,
      asset: tx.asset,
      amount: tx.amount,
      fee: tx.fee,
      status: tx.status,
      timestamp: new Date(tx.timestamp),
      memo: tx.memo
    }));
  }

  /**
   * Get real-time exchange rates
   */
  async getExchangeRates(): Promise<{ [pair: string]: number }> {
    const response = await this.apiCall('/rates/stellar', 'GET', {
      network: this.config.stellarNetwork
    });

    return response.rates;
  }

  /**
   * Check anchor availability for specific corridor
   */
  async checkAnchorAvailability(fromCountry: string, toCountry: string): Promise<{
    available: boolean;
    anchors: string[];
    estimatedTime: string;
    supportedAssets: string[];
  }> {
    const response = await this.apiCall('/stellar/anchors/check', 'GET', {
      fromCountry,
      toCountry,
      network: this.config.stellarNetwork
    });

    return response;
  }

  /**
   * Private helper methods
   */
  private async apiCall(endpoint: string, method: string, data?: any): Promise<any> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Stellar-Network': this.config.stellarNetwork
      }
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      const params = new URLSearchParams(data);
      return fetch(`${url}?${params}`, options).then(res => res.json());
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Onramp API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private mapCurrencyToStablecoin(currency: string): string {
    const mapping: { [key: string]: string } = {
      'USD': 'USDC',
      'EUR': 'EURC',
      'INR': 'USDC', // Convert INR to USDC
      'NGN': 'USDC', // Convert NGN to USDC
      'KES': 'USDC', // Convert KES to USDC
      'TRY': 'EURC', // Convert TRY to EURC
      'BRL': 'USDC', // Convert BRL to USDC
      'VND': 'USDC', // Convert VND to USDC
      'AED': 'USDC', // Convert AED to USDC
    };

    return mapping[currency] || 'USDC';
  }
}

// Default configuration for fi.plus
export const onrampStellar = new OnrampStellarService({
  apiKey: import.meta.env.VITE_ONRAMP_API_KEY || 'demo_key',
  environment: import.meta.env.VITE_ONRAMP_ENV === 'production' ? 'production' : 'sandbox',
  stellarNetwork: import.meta.env.VITE_STELLAR_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
});

export default OnrampStellarService;