import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, ArrowRight, Loader2, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { currencyBridge, type BridgeQuote } from "@/lib/currencyBridge";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { walletService } from "@/lib/walletService";

const CRYPTO_ASSETS = [
  { code: 'XLM', name: 'Stellar Lumens', balance: () => walletService.getBalance('XLM') },
  { code: 'USDC', name: 'USD Coin', balance: () => walletService.getBalance('USDC') },
  { code: 'USDT', name: 'Tether USD', balance: () => walletService.getBalance('USDT') }
];

const CONVERSION_TYPES = [
  { id: 'fiat_to_crypto', name: 'Fiat to Crypto', description: 'Buy crypto with fiat currency' },
  { id: 'crypto_to_fiat', name: 'Crypto to Fiat', description: 'Sell crypto for fiat currency' },
  { id: 'fiat_to_fiat', name: 'Cross-Border', description: 'Send money between countries' },
  { id: 'crypto_to_crypto', name: 'Asset Swap', description: 'Exchange between crypto assets' }
];

export default function UniversalConvert() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversionType, setConversionType] = useState('fiat_to_fiat');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [fromAsset, setFromAsset] = useState<'XLM' | 'USDC' | 'USDT'>('XLM');
  const [toAsset, setToAsset] = useState<'XLM' | 'USDC' | 'USDT'>('USDC');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [step, setStep] = useState<'quote' | 'confirm' | 'processing' | 'complete'>('quote');

  // Auto-fetch quote when parameters change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const timer = setTimeout(fetchQuote, 500);
      return () => clearTimeout(timer);
    } else {
      setQuote(null);
    }
  }, [amount, fromCurrency, toCurrency, fromAsset, toAsset, conversionType]);

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoadingQuote(true);
    try {
      let quote: BridgeQuote;
      
      switch (conversionType) {
        case 'fiat_to_crypto':
          quote = await currencyBridge.getConversionQuote(fromCurrency, 'XLM', parseFloat(amount));
          break;
        case 'crypto_to_fiat':
          quote = await currencyBridge.getConversionQuote('XLM', toCurrency, parseFloat(amount));
          break;
        case 'fiat_to_fiat':
          quote = await currencyBridge.getConversionQuote(fromCurrency, toCurrency, parseFloat(amount));
          break;
        case 'crypto_to_crypto':
          quote = await currencyBridge.getConversionQuote(fromAsset, toAsset, parseFloat(amount), fromAsset);
          break;
        default:
          throw new Error('Invalid conversion type');
      }
      
      setQuote(quote);
    } catch (error) {
      console.error('Quote fetch error:', error);
      toast({
        title: "Quote Error",
        description: "Unable to fetch conversion rates. Please try again.",
        variant: "destructive"
      });
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const swapCurrencies = () => {
    if (conversionType === 'fiat_to_fiat') {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
    } else if (conversionType === 'crypto_to_crypto') {
      const temp = fromAsset;
      setFromAsset(toAsset);
      setToAsset(temp);
    }
  };

  const executeConversion = async () => {
    if (!quote || !user?.email) return;

    setStep('processing');
    try {
      const transaction = await currencyBridge.executeConversion(
        quote,
        user.email,
        {} // Bank details would be collected in a proper flow
      );

      toast({
        title: "Conversion Initiated",
        description: `Transaction ${transaction.id} is being processed`,
      });
      
      setStep('complete');
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "Unable to process conversion. Please try again.",
        variant: "destructive"
      });
      setStep('confirm');
    }
  };

  const renderCurrencySelect = (
    value: string,
    onChange: (value: string) => void,
    currencies: Array<{ code: string; name: string; flag?: string; balance?: () => number }>,
    label: string
  ) => (
    <div>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center space-x-2">
                  {currency.flag && <span>{currency.flag}</span>}
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-gray-500 text-xs">{currency.name}</span>
                </span>
                {currency.balance && (
                  <span className="text-xs text-blue-600 ml-2">
                    {currency.balance().toLocaleString()}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderRouteVisualization = () => {
    if (!quote) return null;

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-blue-900">Conversion Route</h3>
          <Badge variant={quote.route === 'direct' ? 'default' : 'secondary'}>
            {quote.route === 'direct' ? 'Direct' : 'XLM Bridge'}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {quote.steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-blue-200 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate:</span>
            <span className="font-medium">1 {quote.fromCurrency} = {quote.exchangeRate.toFixed(4)} {quote.toCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Processing Time:</span>
            <span className="text-blue-600">{quote.estimatedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Fees:</span>
            <span className="text-red-600">{quote.fees.total.toFixed(2)} {quote.fromCurrency}</span>
          </div>
          <div className="flex justify-between font-medium text-green-600 border-t pt-2">
            <span>You Receive:</span>
            <span>{quote.toAmount.toFixed(2)} {quote.toCurrency}</span>
          </div>
        </div>
      </div>
    );
  };

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Conversion</h2>
            <p className="text-gray-600 mb-4">
              Converting {amount} {quote?.fromCurrency} to {quote?.toCurrency}
            </p>
            {quote?.route === 'bridge' && (
              <div className="text-sm text-blue-600">
                Using XLM bridge for optimal rates
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversion Complete</h2>
            <p className="text-gray-600 mb-6">
              Successfully converted {amount} {quote?.fromCurrency} to {quote?.toAmount.toFixed(2)} {quote?.toCurrency}
            </p>
            <Button onClick={() => setStep('quote')} className="w-full">
              Convert More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Universal Currency Bridge</h1>
          <p className="text-gray-600">Convert between any supported currency using XLM as bridge</p>
        </div>

        {/* Conversion Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversion Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONVERSION_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    conversionType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConversionType(type.id)}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversion Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* From Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {conversionType === 'fiat_to_fiat' || conversionType === 'fiat_to_crypto' ? (
                    renderCurrencySelect(fromCurrency, setFromCurrency, SUPPORTED_CURRENCIES, "From Currency")
                  ) : (
                    renderCurrencySelect(fromAsset, setFromAsset as any, CRYPTO_ASSETS, "From Asset")
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 mt-1 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapCurrencies}
                  className="h-10 w-10 rounded-full p-0"
                  disabled={conversionType === 'fiat_to_crypto' || conversionType === 'crypto_to_fiat'}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>

              {/* To Section */}
              <div className="space-y-4">
                {conversionType === 'fiat_to_fiat' || conversionType === 'crypto_to_fiat' ? (
                  renderCurrencySelect(toCurrency, setToCurrency, SUPPORTED_CURRENCIES, "To Currency")
                ) : (
                  renderCurrencySelect(toAsset, setToAsset as any, CRYPTO_ASSETS, "To Asset")
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoadingQuote && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Fetching best rates...</span>
              </div>
            )}

            {/* Quote Display */}
            {quote && !isLoadingQuote && renderRouteVisualization()}

            {/* Action Button */}
            {quote && !isLoadingQuote && (
              <Button 
                onClick={() => setStep('confirm')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Continue Conversion
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Step */}
        {step === 'confirm' && quote && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Conversion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">Conversion Summary</h3>
                <div className="space-y-1 text-sm text-yellow-700">
                  <div>You send: {quote.fromAmount} {quote.fromCurrency}</div>
                  <div>You receive: {quote.toAmount.toFixed(2)} {quote.toCurrency}</div>
                  <div>Route: {quote.route === 'direct' ? 'Direct conversion' : 'XLM bridge conversion'}</div>
                  <div>Total fees: {quote.fees.total.toFixed(2)} {quote.fromCurrency}</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep('quote')} className="flex-1">
                  Back to Quote
                </Button>
                <Button onClick={executeConversion} className="flex-1 bg-green-600 hover:bg-green-700">
                  Confirm Conversion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}