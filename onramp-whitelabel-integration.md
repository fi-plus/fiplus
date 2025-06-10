# Onramp Whitelabel Integration Guide

Based on https://docs.onramp.money/onramp-whitelabel-unlisted

## Key Integration Points

### 1. Widget Embedding
- Onramp provides hosted widget URLs for payment processing
- Widget handles KYC, payment methods, and transaction processing
- Return URLs for success/failure handling

### 2. API Endpoints (Need Verification)
Common whitelabel endpoints typically include:
- `/widget/create` - Create payment session
- `/transaction/{id}` - Get transaction status
- `/user/kyc` - KYC verification status
- `/currencies` - Supported currencies

### 3. Webhook Integration
- Real-time transaction status updates
- Payment completion notifications
- KYC status changes

### 4. Environment Configuration
Required environment variables:
- ONRAMP_API_KEY
- ONRAMP_SECRET_KEY
- ONRAMP_APP_ID
- ONRAMP_ENVIRONMENT (sandbox/production)

## Implementation Priority
1. Widget-based payment flow (primary)
2. Transaction status polling
3. Webhook handling for real-time updates
4. KYC verification integration

This approach eliminates direct blockchain handling and focuses on payment UI integration.