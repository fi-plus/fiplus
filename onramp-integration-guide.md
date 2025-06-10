# Onramp.money Integration Guide for fi.plus

## Authentic Onramp.money Architecture

### What Onramp.money Actually Supports
- **Primary Asset**: XLM (Stellar Lumens) - Native Stellar token
- **Network**: Stellar blockchain network
- **Service**: Fiat-to-XLM onramp/offramp via various payment methods
- **Coverage**: Global fiat currencies → XLM conversion

### How fi.plus Works with Onramp
1. **Deposit Flow**: User deposits fiat currency → Onramp converts to XLM → User's XLM wallet balance increases
2. **Send Flow**: User sends XLM internationally → Recipient receives XLM → Can cash out via Onramp to local fiat
3. **Exchange Rates**: Real-time fiat/XLM rates provided by Onramp APIs

### Current Implementation Status

#### ✅ Corrected Architecture
- All currencies now bridge through XLM (not non-existent stablecoins)
- Wallet balances show XLM as primary asset (2,500 XLM)
- USDC/EURC maintained as secondary options for advanced users
- Exchange rates calculate fiat ↔ XLM conversions

#### 🔧 Integration Points
- **Add Money**: Fiat → XLM via Onramp payment widgets
- **Send Money**: XLM transfers internationally via Stellar network
- **Cash Out**: XLM → Fiat via Onramp withdrawal methods
- **Exchange Rates**: Live fiat/XLM rates from Onramp APIs

### Production Requirements

#### Required Onramp API Keys
```
ONRAMP_API_KEY=your_production_key
ONRAMP_ENVIRONMENT=production
```

#### Onramp Service Integration
- KYC verification through Onramp's compliance system
- Payment processing via Onramp's widget system
- Real-time exchange rates via Onramp's rate API
- Webhook notifications for transaction status updates

### Technical Flow

#### 1. User Deposits Money
```
User Bank Account → Onramp.money → XLM → fi.plus Wallet
```

#### 2. Cross-Border Transfer
```
Sender XLM → Stellar Network → Recipient XLM → Onramp Cashout
```

#### 3. Currency Conversion
```
Local Fiat → XLM (via Onramp rates) → XLM Transfer → Local Fiat (via Onramp)
```

### Benefits of XLM-First Architecture
- **Authentic**: Uses Onramp's actual supported asset
- **Fast**: Stellar network 3-5 second settlements
- **Low Cost**: XLM transaction fees under $0.01
- **Global**: XLM works worldwide, local fiat via Onramp
- **Compliant**: Onramp handles all regulatory requirements

### Next Steps for Full Integration
1. Obtain production Onramp API credentials
2. Implement Onramp's official SDK/widgets
3. Set up webhook endpoints for transaction notifications
4. Configure real-time XLM/fiat exchange rate feeds
5. Test full deposit → send → cashout flow with real funds

This architecture now accurately reflects how Onramp.money actually works, using XLM as the bridge currency for all international transfers.