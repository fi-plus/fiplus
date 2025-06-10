# Onramp.money API Research

## Current Integration Status

### Provided Credentials
- Base URL: `https://api-test.onramp.money`
- App ID: `1596446`
- API Key: `a7KTmnb2Qx8wploYvs9cNMIrLJhWqT`
- API Secret: `q8XJvzb1Ns6dyrmUow3eCKLaPtHgMf`

### API Endpoint Testing Results
- `/health` - 404 Not Found
- `/onramp/quote` - 404 Not Found
- `/api/v1/rates` - 404 Not Found
- `/docs` - 404 Not Found

### Common API Patterns to Test
1. `/v1/quotes`
2. `/api/quotes`
3. `/api/v1/quotes`
4. `/quotes`
5. `/rates`
6. `/transactions`
7. `/sessions`
8. `/widget/config`

### Authentication Methods to Try
1. Bearer token in Authorization header
2. API key in header
3. Basic auth with key:secret
4. Query parameters
5. POST body authentication

### Next Steps
1. Contact Onramp support for proper API documentation
2. Test alternative endpoint structures
3. Implement widget-based integration as fallback
4. Use webhook URLs for transaction completion

### Widget Integration Alternative
If REST API is not available, implement widget-based flow:
1. Generate widget session URL
2. Redirect user to Onramp widget
3. Handle webhook notifications
4. Update transaction status in database