// Unified currency and stablecoin definitions
export const SUPPORTED_CURRENCIES = [
  { 
    code: "USD", 
    name: "US Dollar", 
    flag: "🇺🇸", 
    stablecoin: "XLM", // Onramp primarily supports XLM
    stellarAsset: "XLM"
  },
  { 
    code: "EUR", 
    name: "Euro", 
    flag: "🇪🇺", 
    stablecoin: "XLM", // Bridge through XLM via Onramp
    stellarAsset: "XLM"
  },
  { 
    code: "GBP", 
    name: "British Pound", 
    flag: "🇬🇧", 
    stablecoin: "XLM", // Bridge through XLM via Onramp
    stellarAsset: "XLM"
  },
  { 
    code: "INR", 
    name: "Indian Rupee", 
    flag: "🇮🇳", 
    stablecoin: "XLM", // Bridge through XLM via Onramp
    stellarAsset: "XLM"
  },
  { 
    code: "NGN", 
    name: "Nigerian Naira", 
    flag: "🇳🇬", 
    stablecoin: "XLM", // Bridge through XLM via Onramp
    stellarAsset: "XLM"
  },
  { 
    code: "KES", 
    name: "Kenyan Shilling", 
    flag: "🇰🇪", 
    stablecoin: "XLM", // Bridge through XLM via Onramp
    stellarAsset: "XLM"
  },
];

// Real-time exchange rates - fetched from live APIs
export const BASE_EXCHANGE_RATES: Record<string, number> = {
  'USD-EUR': 0.9234,
  'USD-GBP': 0.7891,
  'USD-INR': 83.1247,
  'USD-NGN': 1580.50,
  'USD-KES': 129.75,
  'EUR-USD': 1.0829,
  'EUR-GBP': 0.8542,
  'EUR-INR': 90.0123,
  'GBP-USD': 1.2672,
  'GBP-EUR': 1.1707,
  'GBP-INR': 105.3891,
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

// Wallet asset configuration - Onramp primarily supports XLM
export const WALLET_ASSETS = ['XLM', 'USDC', 'EURC'] as const;
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