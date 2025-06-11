import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Smartphone, Wallet, Clock, DollarSign, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MobileNavigation from "@/components/MobileNavigation";
import { SUPPORTED_CURRENCIES, calculateFee, WALLET_ASSETS } from "@/lib/constants";
// Using backend API endpoints directly

const CASHOUT_METHODS = {
  'onramp_offramp': {
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Convert XLM to fiat currency via Onramp',
    fee: 'Real-time rates from Onramp API',
    time: '5-15 minutes',
    minAmount: 10,
    available: ['INR'] // Only INR confirmed working in sandbox
  }
};



export default function Cashout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'details' | 'confirm' | 'processing' | 'success'>('select');
  const [amount, setAmount] = useState("");
  const [fromAsset, setFromAsset] = useState("XLM");
  const [toCurrency, setToCurrency] = useState("USD");
  const [cashoutMethod, setCashoutMethod] = useState<string>("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountName: "",
    bankName: ""
  });
  const [mobileDetails, setMobileDetails] = useState({
    phoneNumber: "",
    provider: ""
  });
  const [offrampQuote, setOfframpQuote] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const selectedMethod = cashoutMethod ? CASHOUT_METHODS[cashoutMethod as keyof typeof CASHOUT_METHODS] : null;
  const availableMethods = Object.entries(CASHOUT_METHODS).filter(([, method]) => 
    method.available.includes(toCurrency)
  );

  // Fetch real-time offramp quote from Onramp
  const fetchOfframpQuote = async () => {
    if (!amount || !toCurrency || cashoutMethod !== 'onramp_offramp') return;
    
    setIsLoadingQuote(true);
    try {
      const response = await fetch('/api/onramp/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'offramp',
          cryptoCurrency: fromAsset,
          cryptoAmount: parseFloat(amount),
          fiatCurrency: toCurrency
        })
      });
      
      if (!response.ok) throw new Error('Quote request failed');
      const quote = await response.json();
      setOfframpQuote(quote);
    } catch (error) {
      console.error('Failed to fetch offramp quote:', error);
      toast({
        title: "Quote Error",
        description: "Unable to fetch current rates. Please try again.",
        variant: "destructive"
      });
      setOfframpQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const calculateFee = () => {
    if (cashoutMethod === 'onramp_offramp' && offrampQuote) {
      return offrampQuote.fees.total;
    }
    if (!selectedMethod || !amount) return 0;
    const feePercent = parseFloat(selectedMethod.fee.replace('%', '')) / 100;
    return parseFloat(amount) * feePercent;
  };

  const calculateReceiveAmount = () => {
    if (cashoutMethod === 'onramp_offramp' && offrampQuote) {
      return offrampQuote.fiatAmount;
    }
    if (!amount) return 0;
    return parseFloat(amount) - calculateFee();
  };

  // Auto-fetch quote when parameters change for Onramp
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (cashoutMethod === 'onramp_offramp' && value && parseFloat(value) > 0) {
      setTimeout(fetchOfframpQuote, 500); // Debounce
    }
  };

  const handleMethodChange = (method: string) => {
    setCashoutMethod(method);
    if (method === 'onramp_offramp' && amount && parseFloat(amount) > 0) {
      fetchOfframpQuote();
    } else {
      setOfframpQuote(null);
    }
    setStep('details');
  };

  const handleContinue = () => {
    if (!amount || parseFloat(amount) < (selectedMethod?.minAmount || 0)) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is ${selectedMethod?.minAmount} ${toCurrency}`,
        variant: "destructive",
      });
      return;
    }

    if (cashoutMethod === 'bank_transfer' && (!bankDetails.accountNumber || !bankDetails.accountName)) {
      toast({
        title: "Bank Details Required",
        description: "Please fill in all required bank information.",
        variant: "destructive",
      });
      return;
    }

    if (cashoutMethod === 'mobile_money' && !mobileDetails.phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your mobile money phone number.",
        variant: "destructive",
      });
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('processing');
    
    try {
      if (cashoutMethod === 'onramp_offramp') {
        // Create Onramp offramp transaction
        const response = await fetch('/api/onramp/offramp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            cryptoCurrency: fromAsset,
            cryptoAmount: parseFloat(amount),
            fiatCurrency: toCurrency,
            fiatAmount: offrampQuote?.fiatAmount || calculateReceiveAmount(),
            walletAddress: `GCEXAMPLE${user?.id}STELLARWALLET`,
            userEmail: user?.email || '',
            bankDetails: {
              accountNumber: bankDetails.accountNumber,
              routingNumber: bankDetails.routingNumber,
              bankName: bankDetails.bankName,
              accountHolderName: bankDetails.accountName
            },
            paymentMethod: 'bank_transfer'
          })
        });
        
        if (!response.ok) throw new Error('Offramp transaction failed');
        const offrampTransaction = await response.json();

        // Record transaction in backend
        await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'cashout',
            fromCurrency: fromAsset,
            toCurrency: toCurrency,
            amount: parseFloat(amount),
            method: cashoutMethod,
            status: 'pending',
            externalId: offrampTransaction.transactionId
          })
        });

        setTimeout(() => {
          setStep('success');
          toast({
            title: "Onramp Offramp Initiated",
            description: `Your ${toCurrency} ${calculateReceiveAmount().toFixed(2)} withdrawal is being processed via Onramp. Transaction ID: ${offrampTransaction.transactionId}`,
          });
        }, 2000);
      } else {
        // Process traditional cashout transaction
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: 'cashout',
            fromCurrency: fromAsset,
            toCurrency: toCurrency,
            amount: parseFloat(amount),
            method: cashoutMethod,
            status: 'pending'
          })
        });
        
        const transaction = await response.json();
        
        setTimeout(() => {
          setStep('success');
          toast({
            title: "Cashout Initiated",
            description: `Your ${toCurrency} ${calculateReceiveAmount().toFixed(2)} withdrawal is being processed. Transaction ID: ${transaction.id}`,
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Cashout error:', error);
      toast({
        title: "Cashout Failed",
        description: "Unable to process withdrawal. Please try again.",
        variant: "destructive"
      });
      setStep('confirm');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">fi.plus</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Cash Out</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500">
                Available Balance: $0 ${fromAsset}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'select' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Cash Out Your Money</h1>
              <p className="text-xl text-gray-600">
                Convert your stablecoins to local currency and withdraw to your preferred method
              </p>
            </div>

            {/* Wallet Balances */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">Available Balances</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {WALLET_ASSETS.map((asset) => (
                    <div key={asset} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{asset}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{asset}</div>
                          <div className="text-xs text-gray-500">
                            {asset === 'USDC' ? 'USD Coin' : asset === 'EURC' ? 'Euro Coin' : 'Stellar Lumens'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">0</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Settings */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>From Asset</Label>
                    <Select value={fromAsset} onValueChange={setFromAsset}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WALLET_ASSETS.map((asset) => (
                          <SelectItem key={asset} value={asset}>
                            {asset} - 0
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>To Currency</Label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                              <span className="text-gray-500">{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Real-time Onramp Offramp Quote */}
                {cashoutMethod === 'onramp_offramp' && amount && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-green-900">Real-time Offramp Quote</h3>
                      {isLoadingQuote && (
                        <div className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
                      )}
                    </div>
                    
                    {offrampQuote && !isLoadingQuote && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">You send:</span>
                          <span className="font-medium">{amount} {fromAsset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exchange rate:</span>
                          <span>1 {fromAsset} = {offrampQuote.exchangeRate} {toCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Onramp fee:</span>
                          <span>{offrampQuote.fees.total.toFixed(2)} {toCurrency}</span>
                        </div>
                        <div className="flex justify-between font-medium text-green-600 border-t pt-2">
                          <span>You receive:</span>
                          <span>{offrampQuote.fiatAmount.toFixed(2)} {toCurrency}</span>
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          Processing time: {offrampQuote.estimatedTime}
                        </div>
                      </div>
                    )}
                    
                    {!offrampQuote && !isLoadingQuote && (
                      <div className="text-sm text-gray-500">
                        Enter amount to see live pricing
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cashout Methods */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Cashout Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableMethods.map(([key, method]) => {
                  const Icon = method.icon;
                  return (
                    <Card key={key} className="shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleMethodChange(key)}>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{method.name}</h3>
                        <p className="text-gray-600 mb-4">{method.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Fee:</span>
                            <span className="font-medium">{method.fee}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Time:</span>
                            <span className="font-medium">{method.time}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Min:</span>
                            <span className="font-medium">{method.minAmount} {toCurrency}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          Select Method
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 'details' && selectedMethod && (
          <div className="space-y-8">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <selectedMethod.icon className="w-6 h-6 text-blue-600" />
                  <span>{selectedMethod.name} Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-700">Withdrawal Amount:</span>
                    <span className="text-2xl font-bold text-blue-800">{amount} {toCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Fee ({selectedMethod.fee}):</span>
                    <span>{calculateFee().toFixed(2)} {toCurrency}</span>
                  </div>
                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-bold text-blue-800">
                    <span>You'll receive:</span>
                    <span>{calculateReceiveAmount().toFixed(2)} {toCurrency}</span>
                  </div>
                </div>

                {/* Method-specific forms */}
                {cashoutMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountName">Account Holder Name</Label>
                        <Input
                          id="accountName"
                          value={bankDetails.accountName}
                          onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          value={bankDetails.routingNumber}
                          onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {cashoutMethod === 'mobile_money' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Mobile Money Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+254 xxx xxx xxx"
                          value={mobileDetails.phoneNumber}
                          onChange={(e) => setMobileDetails({...mobileDetails, phoneNumber: e.target.value})}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={mobileDetails.provider} onValueChange={(value) => setMobileDetails({...mobileDetails, provider: value})}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                            <SelectItem value="airtel">Airtel Money</SelectItem>
                            <SelectItem value="gcash">GCash</SelectItem>
                            <SelectItem value="paymaya">PayMaya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {cashoutMethod === 'instant_cash' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cash Pickup Information</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        You'll receive a pickup code via SMS. Present this code and your ID at any partner location to collect your cash.
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
                >
                  Continue to Confirmation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'confirm' && selectedMethod && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Confirm Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{selectedMethod.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{amount} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium">{calculateFee().toFixed(2)} {toCurrency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>You'll receive:</span>
                  <span>{calculateReceiveAmount().toFixed(2)} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expected time:</span>
                  <span className="font-medium">{selectedMethod.time}</span>
                </div>
              </div>

              <Button 
                onClick={handleConfirm}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 text-lg"
              >
                Confirm Withdrawal
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'processing' && (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Your Withdrawal</h3>
              <p className="text-gray-600">
                Your cashout request is being processed. You'll receive a confirmation shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="shadow-lg border-0">
            <CardContent className="text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Initiated!</h3>
                <p className="text-gray-600">
                  Your {toCurrency} {calculateReceiveAmount().toFixed(2)} withdrawal has been successfully initiated.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-lg font-bold text-green-800">
                  Expected delivery: {selectedMethod?.time}
                </div>
              </div>

              <Button 
                onClick={() => window.location.href = '/history'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
              >
                View Transaction History
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}