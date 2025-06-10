# Onramp Whitelabel Integration - fi.plus

## Implementation Overview
Based on: https://docs.onramp.money/onramp-whitelabel-unlisted

### Whitelabel Architecture
Our fi.plus platform uses Onramp's whitelabel solution to provide seamless fiat-to-crypto and crypto-to-fiat conversions while maintaining our brand identity.

### Integration Components

#### 1. Onramp Widget Integration
```typescript
// client/src/lib/onramp.ts
export class OnrampWidget {
  async init(): Promise<void> {
    // Loads Onramp widget script dynamically
    // Initializes with fi.plus branding
  }
  
  static createOnrampWidget(elementId: string, options: Partial<OnrampWidgetConfig>)
  static createOfframpWidget(elementId: string, options: Partial<OnrampWidgetConfig>)
}
```

#### 2. Whitelabel Configuration
```typescript
export const onrampWhitelabel = new OnrampWhitelabel({
  apiKey: process.env.VITE_ONRAMP_API_KEY,
  environment: 'sandbox', // or 'production'
  partnerName: 'fi.plus',
  brandColor: '#2563eb',
  logoUrl: '/logo.png'
});
```

### User Flows

#### Onramp Flow (Fiat → XLM)
1. User selects "Onramp Deposit" in Add Money
2. Enters fiat amount and currency
3. Onramp widget loads with fi.plus branding
4. User completes KYC and payment via Onramp
5. XLM delivered directly to user's fi.plus wallet
6. Transaction recorded in fi.plus system

#### Offramp Flow (XLM → Fiat)
1. User selects "Onramp Offramp" in Cash Out
2. Enters XLM amount to convert
3. Onramp widget loads for crypto-to-fiat conversion
4. User provides bank details via Onramp interface
5. XLM converted to fiat and sent to user's bank
6. Transaction recorded in fi.plus system

### Technical Implementation

#### Session Management
```typescript
async createOnrampSession(options: {
  fiatCurrency: string;
  fiatAmount: number;
  cryptoCurrency: string; // Always 'XLM'
  walletAddress: string;
  userEmail?: string;
  redirectUrl?: string;
})
```

#### Webhook Integration
- Endpoint: `/api/onramp/webhook`
- Handles transaction status updates from Onramp
- Updates fi.plus wallet balances automatically
- Sends notifications to users

### Security & Compliance

#### KYC Integration
- Embedded KYC flow within Onramp widget
- Seamless user experience
- Onramp handles all compliance requirements
- fi.plus receives verification status

#### API Security
- Secure API key management
- Webhook signature verification
- HTTPS-only communication
- Environment-based configuration

### Branding Customization

#### Visual Elements
- fi.plus logo and colors
- Consistent UI/UX with main platform
- Custom success/redirect pages
- Branded transaction receipts

#### User Experience
- Single sign-on from fi.plus
- Pre-filled user information
- Seamless wallet integration
- Real-time balance updates

### Production Requirements

#### Environment Variables
```
VITE_ONRAMP_API_KEY=your_production_api_key
ONRAMP_WEBHOOK_SECRET=your_webhook_secret
```

#### API Endpoints
- Sandbox: `https://api.sandbox.onramp.money`
- Production: `https://api.onramp.money`
- Widget: `https://widget.onramp.money`

#### Supported Currencies
- Fiat: USD, EUR, GBP, INR, NGN, KES
- Crypto: XLM (primary), USDC, EURC
- All transactions bridge through XLM

### Benefits of Whitelabel Integration

#### For fi.plus
- Maintains brand consistency
- No complex compliance overhead
- Real-time transaction processing
- Global fiat currency support

#### For Users
- Seamless experience within fi.plus
- No need to leave the platform
- Instant XLM delivery
- Secure KYC and payment processing

#### For Compliance
- Onramp handles all regulatory requirements
- Built-in AML/KYC verification
- Transaction monitoring and reporting
- Multi-jurisdiction compliance

### Next Steps for Production

1. **API Key Setup**
   - Obtain production Onramp API keys
   - Configure webhook endpoints
   - Set up monitoring and alerts

2. **Testing**
   - Sandbox environment testing
   - End-to-end transaction flows
   - Webhook integration verification
   - User acceptance testing

3. **Deployment**
   - Production environment setup
   - Real transaction processing
   - Live wallet integration
   - Customer support integration

This whitelabel integration provides fi.plus with enterprise-grade fiat-crypto conversion capabilities while maintaining complete control over the user experience and brand presentation.