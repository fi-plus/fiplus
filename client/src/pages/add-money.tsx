import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, ArrowRight, DollarSign, Star, CheckCircle2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CURRENCIES, calculateFee, getStablecoinByCurrency } from "@/lib/constants";
// Services removed - using backend API directly
// Using backend API endpoints directly

const FUNDING_METHODS = {
  'onramp_deposit': {
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Add money using bank transfer via Onramp',
    fee: 'Real-time rates from Onramp API',
    time: '5-15 minutes',
    available: ['INR'] // Only INR confirmed working in sandbox
  }
};

export default function AddMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paymentMethod, setPaymentMethod] = useState<string>("onramp_deposit");
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');
  const [quote, setQuote] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency);
  const availableMethods = Object.entries(FUNDING_METHODS).filter(([key, method]) => 
    method.available.includes(currency)
  );

  // Fetch real-time quote from Onramp for pricing transparency
  const fetchQuote = async () => {
    if (!amount || !currency || paymentMethod !== 'onramp_deposit') return;
    
    setIsLoadingQuote(true);
    try {
      const response = await fetch('/api/onramp/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fiatCurrency: currency,
          fiatAmount: parseFloat(amount),
          cryptoCurrency: 'XLM'
        })
      });
      
      if (!response.ok) throw new Error('Quote request failed');
      const quoteResult = await response.json();
      setQuote(quoteResult);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      toast({
        title: "Quote Error",
        description: "Unable to fetch current rates. Please try again.",
        variant: "destructive"
      });
      setQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Auto-fetch quote when parameters change
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (paymentMethod === 'onramp_deposit' && value && parseFloat(value) > 0) {
      setTimeout(fetchQuote, 500); // Debounce
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method === 'onramp_deposit' && amount && parseFloat(amount) > 0) {
      fetchQuote();
    } else {
      setQuote(null);
    }
  };

  const calculateFee = () => {
    if (!paymentMethod || !amount) return 0;
    const method = FUNDING_METHODS[paymentMethod as keyof typeof FUNDING_METHODS];
    const feePercent = parseFloat(method.fee.replace('%', '')) / 100;
    return parseFloat(amount) * feePercent;
  };

  const getTotalAmount = () => {
    const baseAmount = parseFloat(amount) || 0;
    const fee = calculateFee();
    return baseAmount + fee;
  };

  const handleAddMoney = () => {
    if (!amount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select payment method.",
        variant: "destructive",
      });
      return;
    }

    setStep('payment');
  };

  const processPayment = async () => {
    setStep('processing');
    
    try {
      // Get real quote from backend API
      const quoteResponse = await fetch('/api/onramp/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fiatCurrency: currency,
          fiatAmount: parseFloat(amount),
          cryptoCurrency: 'XLM'
        })
      });
      
      if (!quoteResponse.ok) throw new Error('Quote request failed');
      const quote = await quoteResponse.json();
      
      // Create KYC URL for user verification
      const kycResponse = await fetch('/api/onramp/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userEmail: user?.email || 'user@fiplus.com',
          phoneNumber: '+91-9999999999'
        })
      });
      
      if (!kycResponse.ok) throw new Error('KYC request failed');
      const kycResult = await kycResponse.json();
      
      // Store transaction details for completion
      localStorage.setItem('pendingTransaction', JSON.stringify({
        amount: parseFloat(amount),
        currency: currency,
        cryptoAmount: quote.cryptoAmount,
        rate: quote.exchangeRate,
        customerId: kycResult.customerId,
        kycUrl: kycResult.kycUrl
      }));
      
      // Redirect to KYC verification and payment
      window.location.href = kycResult.kycUrl;
    } catch (error) {
      toast({
        title: "Payment Setup Failed",
        description: error instanceof Error ? error.message : "Unable to initialize payment. Please try again.",
        variant: "destructive"
      });
      setStep('select');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Money Added!</h2>
            <p className="text-gray-600 mb-6">
              Your wallet has been credited with {amount} {selectedCurrency?.stablecoin}
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-700">
                <div className="font-medium">Transaction Details:</div>
                <div>Amount: {amount} {currency}</div>
                <div>Received: {amount} XLM</div>
                <div>Fee: {calculateFee().toFixed(2)} {currency}</div>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <DollarSign className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h2>
            <p className="text-gray-600 mb-4">
              Converting {amount} {currency} to XLM via Onramp...
            </p>
            <div className="text-sm text-gray-500">
              This may take a few moments
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'payment') {
    const method = FUNDING_METHODS[paymentMethod as keyof typeof FUNDING_METHODS];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Star className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">fi.plus</h1>
              </div>
              <Button variant="ghost" onClick={() => setStep('select')}>
                Back
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <method.icon className="w-6 h-6 text-blue-600" />
                <span>Complete Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{amount} {currency}</span>
                  </div>
                  {paymentMethod === 'onramp_deposit' && quote && (
                    <>
                      <div className="flex justify-between">
                        <span>Exchange Rate:</span>
                        <span>1 {currency} = {quote.exchangeRate} XLM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Onramp Fee:</span>
                        <span>{quote.fees.total.toFixed(2)} {currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Time:</span>
                        <span>{quote.estimatedTime}</span>
                      </div>
                    </>
                  )}
                  {paymentMethod !== 'onramp_deposit' && (
                    <div className="flex justify-between">
                      <span>Fee ({method.fee}):</span>
                      <span>{calculateFee().toFixed(2)} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Cost:</span>
                    <span>
                      {paymentMethod === 'onramp_deposit' && quote 
                        ? (parseFloat(amount) + quote.fees.total).toFixed(2)
                        : getTotalAmount().toFixed(2)
                      } {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>You'll receive:</span>
                    <span>
                      {paymentMethod === 'onramp_deposit' && quote 
                        ? quote.cryptoAmount.toFixed(2)
                        : amount
                      } XLM
                    </span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'stellar_wallet' && (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-xs text-gray-500">Stellar Wallet QR Code</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Send XLM to this address from your Stellar wallet
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">Stellar Address:</div>
                    <div className="font-mono text-sm break-all">
                      GCEXAMPLE{user?.id}STELLARWALLETADDRESS
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Memo: FP{user?.id}DEP{Date.now()}
                  </div>
                </div>
              )}

              {paymentMethod === 'usdc_wallet' && (
                <div className="space-y-4">
                  <h3 className="font-medium">USDC Wallet Transfer</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span>Stellar</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asset:</span>
                      <span>USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Address:</span>
                      <span className="font-mono">GCEXAMPLE{user?.id}USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memo:</span>
                      <span className="font-mono">FP{user?.id}USDC{Date.now()}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'onramp_deposit' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Onramp Whitelabel Integration</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-3">
                      Convert {currency} to XLM using Onramp's secure infrastructure
                    </p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>• Embedded KYC verification</div>
                      <div>• Real-time {currency}/XLM exchange rates</div>
                      <div>• Direct delivery to your Stellar wallet</div>
                      <div>• Whitelabel solution by Onramp.money</div>
                    </div>
                  </div>
                  <div id="onramp-widget" className="min-h-[400px] border rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="text-gray-500 text-sm">Onramp widget will load here</div>
                  </div>
                </div>
              )}

              <Button 
                onClick={processPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {paymentMethod === 'stellar_wallet' ? 'I have sent XLM' : paymentMethod === 'usdc_wallet' ? 'I have sent USDC' : paymentMethod === 'onramp_deposit' ? 'Continue with Onramp' : 'Complete Deposit'}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">fi.plus</h1>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add Money</h1>
          <p className="text-xl text-gray-600">
            Convert your local currency to stablecoins for global transfers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose Amount & Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="text-2xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <span className="flex items-center space-x-2">
                          <span>{curr.flag}</span>
                          <span>{curr.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {amount && paymentMethod !== 'onramp_deposit' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700">
                  You'll receive: <span className="font-bold">{amount} XLM</span>
                </div>
              </div>
            )}

            {paymentMethod === 'onramp_deposit' && amount && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-blue-900">Real-time Onramp Quote</h3>
                  {isLoadingQuote && (
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  )}
                </div>
                
                {quote && !isLoadingQuote && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">You pay:</span>
                      <span className="font-medium">{amount} {currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange rate:</span>
                      <span>1 {currency} = {quote.exchangeRate} XLM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Onramp fee:</span>
                      <span>{quote.fees.total.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between font-medium text-green-600 border-t pt-2">
                      <span>You receive:</span>
                      <span>{quote.cryptoAmount.toFixed(2)} XLM</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2">
                      Processing time: {quote.estimatedTime}
                    </div>
                  </div>
                )}
                
                {!quote && !isLoadingQuote && (
                  <div className="text-sm text-gray-500">
                    Enter amount to see live pricing
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-4">Select Payment Method</label>
              <div className="space-y-3">
                {availableMethods.map(([key, method]) => (
                  <div key={key} className="relative">
                    <input
                      type="radio"
                      id={key}
                      name="paymentMethod"
                      value={key}
                      checked={paymentMethod === key}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={key}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <method.icon className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {method.fee} fee
                          </Badge>
                          <div className="text-xs text-gray-500">{method.time}</div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleAddMoney}
              disabled={!amount || !paymentMethod}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}