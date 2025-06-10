import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, ArrowRight, DollarSign, Star, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CURRENCIES, calculateFee, getStablecoinByCurrency } from "@/lib/constants";

const PAYMENT_METHODS = {
  'upi': {
    name: 'UPI',
    icon: Smartphone,
    description: 'Instant payment via UPI',
    fee: '0%',
    time: 'Instant',
    available: ['INR']
  },
  'bank_transfer': {
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer',
    fee: '0.5%',
    time: '1-3 hours',
    available: ['USD', 'EUR', 'GBP', 'INR']
  },
  'debit_card': {
    name: 'Debit Card',
    icon: CreditCard,
    description: 'Instant payment via card',
    fee: '2.9%',
    time: 'Instant',
    available: ['USD', 'EUR', 'GBP']
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
  const availableMethods = Object.entries(PAYMENT_METHODS).filter(([key, method]) => 
    method.available.includes(currency)
  );

  const calculateFee = () => {
    if (!paymentMethod || !amount) return 0;
    const method = PAYMENT_METHODS[paymentMethod as keyof typeof PAYMENT_METHODS];
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
    setTimeout(() => {
      setStep('success');
      toast({
        title: "Money Added Successfully",
        description: `${selectedCurrency?.stablecoin} balance updated in your wallet.`,
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
    const method = PAYMENT_METHODS[paymentMethod as keyof typeof PAYMENT_METHODS];
    
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

              {paymentMethod === 'upi' && (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-xs text-gray-500">QR Code</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your UPI app to complete the payment
                  </p>
                  <div className="text-xs text-gray-500">
                    UPI ID: fiplus@paytm
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Bank Transfer Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bank Name:</span>
                      <span>Fi.Plus Bank Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <span>1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SWIFT/IFSC:</span>
                      <span>FIPL0001234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-mono">FP{user?.id}TX{Date.now()}</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'debit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <Input placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
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
                  You'll receive: <span className="font-bold">{amount} {selectedCurrency?.stablecoin}</span>
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