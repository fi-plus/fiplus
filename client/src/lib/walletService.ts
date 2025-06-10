import { WALLET_ASSETS, getExchangeRate, calculateFee } from "./constants";

// Centralized wallet balance management
class WalletService {
  private balances = new Map<string, number>();
  
  constructor() {
    // Initialize with realistic balances - XLM is primary since Onramp supports it
    this.balances.set('XLM', 2500.00); // Primary balance in XLM
    this.balances.set('USDC', 750.00);  // Secondary stablecoin balance
    this.balances.set('EURC', 650.50);  // Secondary stablecoin balance
  }

  getBalance(asset: string): number {
    return this.balances.get(asset) || 0;
  }

  getAllBalances(): Record<string, string> {
    const balances: Record<string, string> = {};
    WALLET_ASSETS.forEach(asset => {
      balances[asset] = this.getBalance(asset).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    });
    return balances;
  }

  addFunds(asset: string, amount: number): boolean {
    const currentBalance = this.getBalance(asset);
    this.balances.set(asset, currentBalance + amount);
    return true;
  }

  deductFunds(asset: string, amount: number): boolean {
    const currentBalance = this.getBalance(asset);
    if (currentBalance >= amount) {
      this.balances.set(asset, currentBalance - amount);
      return true;
    }
    return false;
  }

  convertCurrency(fromAsset: string, toAsset: string, amount: number): { success: boolean; convertedAmount?: number; fee?: number } {
    if (!this.deductFunds(fromAsset, amount)) {
      return { success: false };
    }

    const rate = getExchangeRate(fromAsset, toAsset);
    const fee = calculateFee(amount, 'stellar');
    const convertedAmount = (amount - fee) * rate;

    this.addFunds(toAsset, convertedAmount);
    
    return { success: true, convertedAmount, fee };
  }
}

export const walletService = new WalletService();