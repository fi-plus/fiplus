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
import { walletService } from "@/lib/walletService";
import { transactionService } from "@/lib/transactionService";

const FUNDING_METHODS = {
  'stellar_wallet': {
    name: 'Stellar Wallet',
    icon: Wallet,
    description: 'Transfer XLM from your Stellar wallet',
    fee: '0.00001 XLM',
    time: '3-5 seconds',
    available: ['XLM']
  },
  'usdc_wallet': {
    name: 'USDC Wallet',
    icon: CreditCard,
    description: 'Transfer USDC from external wallet',
    fee: '0.00001 XLM',
    time: '3-5 seconds',
    available: ['USDC']
  },
  'onramp_deposit': {
    name: 'Onramp Deposit',
    icon: Building2,
    description: 'Fiat to XLM via Onramp.money',
    fee: 'Variable',
    time: '5-15 minutes',
    available: ['USD', 'EUR', 'GBP', 'INR', 'NGN', 'KES']
  }
};

export default function AddMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [step, setStep] = useState<'select' | 'payment' | 'processing' | 'success'>('select');

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency);
  const availableMethods = Object.entries(FUNDING_METHODS).filter(([key, method]) => 
    method.available.includes(currency)
  );

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

  const processPayment = () => {
    setStep('processing');
    
    // Process the deposit transaction
    const transaction = transactionService.addMoney(
      currency,
      parseFloat(amount),
      paymentMethod
    );
    
    setTimeout(() => {
      setStep('success');
      toast({
        title: "Money Added Successfully",
        description: `XLM balance updated in your wallet. Transaction ID: ${transaction.id}`,
      });
    }, 3000);
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
                  <div className="flex justify-between">
                    <span>Fee ({method.fee}):</span>
                    <span>{calculateFee().toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>{getTotalAmount().toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You'll receive:</span>
                    <span>{amount} XLM</span>
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
                  <h3 className="font-medium">Onramp.money Integration</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-3">
                      This will redirect you to Onramp.money to convert your {currency} to XLM
                    </p>
                    <div className="text-xs text-blue-600">
                      • Secure KYC verification required
                      • Real-time exchange rates
                      • Direct XLM delivery to your fi.plus wallet
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={processPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {paymentMethod === 'upi' ? 'I have paid' : paymentMethod === 'bank_transfer' ? 'I have sent the transfer' : 'Pay Now'}
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
                  onChange={(e) => setAmount(e.target.value)}
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

            {amount && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700">
                  You'll receive: <span className="font-bold">{amount} XLM</span>
                </div>
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
                      onChange={(e) => setPaymentMethod(e.target.value)}
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