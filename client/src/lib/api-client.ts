// Centralized API client for all backend communication
export class ApiClient {
  private baseUrl = '/api';
  
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Onramp integration
  async getOnrampQuote(data: { fiatCurrency: string; fiatAmount: number; cryptoCurrency: string }) {
    return this.request('/onramp/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createKycUrl(data: { userEmail: string; phoneNumber: string }) {
    return this.request('/onramp/kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction management
  async getUserTransactions() {
    return this.request('/transactions');
  }

  async sendMoney(data: any) {
    return this.request('/transactions/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Wallet management
  async getUserWallets() {
    return this.request('/wallets');
  }

  // Exchange rates
  async getExchangeRates() {
    return this.request('/exchange-rates');
  }
}

export const apiClient = new ApiClient();