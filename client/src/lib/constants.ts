// Unified currency and stablecoin definitions
export const SUPPORTED_CURRENCIES = [
  { 
    code: "USD", 
    name: "US Dollar", 
    flag: "🇺🇸", 
    stablecoin: "USDC",
    stellarAsset: "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  { 
    code: "EUR", 
    name: "Euro", 
    flag: "🇪🇺", 
    stablecoin: "EURC",
    stellarAsset: "EURC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  { 
    code: "GBP", 
    name: "British Pound", 
    flag: "🇬🇧", 
    stablecoin: "GBPC",
    stellarAsset: "GBPC:SYNTHETIC" // Placeholder for future implementation
  },
  { 
    code: "INR", 
    name: "Indian Rupee", 
    flag: "🇮🇳", 
    stablecoin: "INRC",
    stellarAsset: "INRC:SYNTHETIC"
  },
  { 
    code: "NGN", 
    name: "Nigerian Naira", 
    flag: "🇳🇬", 
    stablecoin: "NGNC",
    stellarAsset: "NGNC:SYNTHETIC"
  },
  { 
    code: "KES", 
    name: "Kenyan Shilling", 
    flag: "🇰🇪", 
    stablecoin: "KESC",
    stellarAsset: "KESC:SYNTHETIC"
  },
];

// Base exchange rates - should be fetched from real API
export const BASE_EXCHANGE_RATES: Record<string, number> = {
  'USD-EUR': 0.92,
  'USD-GBP': 0.79,
  'USD-INR': 83.12,
  'USD-NGN': 1580.50,
  'USD-KES': 129.75,
  'EUR-USD': 1.09,
  'EUR-GBP': 0.86,
  'EUR-INR': 90.60,
  'GBP-USD': 1.26,
  'GBP-EUR': 1.16,
  'GBP-INR': 104.73,
};

// Stellar network configuration
export const STELLAR_CONFIG = {
  network: 'testnet', // 'testnet' | 'mainnet'
  horizonUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
};

// Fee structure
export const FEE_STRUCTURE = {
  stellar: {
    base: 0.00001, // XLM base fee
    currency: 'XLM'
  },
  onramp: {
    deposit: {
      upi: 0, // 0%
      bank_transfer: 0.005, // 0.5%
      debit_card: 0.029 // 2.9%
    },
    withdrawal: {
      bank_transfer: 0.005, // 0.5%
      mobile_money: 0.01, // 1%
      instant_cash: 0.02 // 2%
    }
  }
};

// Wallet asset configuration
export const WALLET_ASSETS = ['USDC', 'EURC', 'XLM'] as const;
export type WalletAsset = typeof WALLET_ASSETS[number];

// Currency conversion helpers
export function getCurrencyByCode(code: string) {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function getStablecoinByCurrency(currencyCode: string) {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.stablecoin;
}

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1;
  
  const directRate = BASE_EXCHANGE_RATES[`${from}-${to}`];
  if (directRate) return directRate;
  
  const inverseRate = BASE_EXCHANGE_RATES[`${to}-${from}`];
  if (inverseRate) return 1 / inverseRate;
  
  // Calculate via USD if no direct rate
  const fromUsdRate = from === 'USD' ? 1 : BASE_EXCHANGE_RATES[`USD-${from}`] || 1;
  const toUsdRate = to === 'USD' ? 1 : BASE_EXCHANGE_RATES[`USD-${to}`] || 1;
  
  return toUsdRate / fromUsdRate;
}

export function calculateFee(amount: number, feeType: string, method?: string): number {
  if (feeType === 'stellar') {
    return FEE_STRUCTURE.stellar.base;
  }
  
  if (feeType === 'deposit' && method) {
    const rate = FEE_STRUCTURE.onramp.deposit[method as keyof typeof FEE_STRUCTURE.onramp.deposit];
    return amount * (rate || 0);
  }
  
  if (feeType === 'withdrawal' && method) {
    const rate = FEE_STRUCTURE.onramp.withdrawal[method as keyof typeof FEE_STRUCTURE.onramp.withdrawal];
    return amount * (rate || 0);
  }
  
  return 0;
}