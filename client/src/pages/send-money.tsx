import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, Clock, DollarSign, Users, CheckCircle2, MessageSquare, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

import { SUPPORTED_CURRENCIES, getExchangeRate, calculateFee } from "@/lib/constants";
import { queryClient } from "@/lib/queryClient";

export default function SendMoney() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'confirm' | 'processing' | 'success'>('form');
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<'wallet' | 'bank' | 'mobile_money'>('wallet');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const amountParam = urlParams.get('amount');
    
    if (fromParam) setFromCurrency(fromParam);
    if (toParam) setToCurrency(toParam);
    if (amountParam) setAmount(amountParam);
  }, []);

  const calculateExchangeRate = () => {
    return getExchangeRate(fromCurrency, toCurrency);
  };

  const getConvertedAmount = () => {
    const rate = calculateExchangeRate();
    return (parseFloat(amount) * rate).toFixed(2);
  };

  const getFee = () => {
    return calculateFee(parseFloat(amount) || 0, 'stellar');
  };

  const getDeliveryTime = () => {
    switch (deliveryMethod) {
      case 'wallet': return '3-5 seconds';
      case 'bank': return '1-3 hours';
      case 'mobile_money': return '5-15 minutes';
      default: return '3-5 seconds';
    }
  };

  const handleSendMoney = () => {
    if (!amount || !recipient || !recipientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // No wallet balance check - payment happens at send time
    setStep('confirm');
  };

  const confirmSend = async () => {
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
          fiatCurrency: fromCurrency,
          fiatAmount: parseFloat(amount),
          cryptoCurrency: 'XLM'
        })
      });
      
      if (!quoteResponse.ok) {
        throw new Error('Failed to get quote');
      }
      
      const quote = await quoteResponse.json();
      
      // Create KYC URL for payment processing
      const kycResponse = await fetch('/api/onramp/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userEmail: user?.email,
          phoneNumber: '+91-9999999999'
        })
      });
      
      if (!kycResponse.ok) {
        throw new Error('Failed to create KYC URL');
      }
      
      const kycResult = await kycResponse.json();
      
      // Store transaction details for completion
      localStorage.setItem('pendingSendTransaction', JSON.stringify({
        amount: parseFloat(amount),
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        recipient: recipient,
        recipientName: recipientName,
        cryptoAmount: quote.cryptoAmount,
        rate: quote.exchangeRate,
        customerId: kycResult.customerId,
        kycUrl: kycResult.kycUrl,
        deliveryMethod: deliveryMethod
      }));
      
      // Redirect to Onramp payment processing
      window.location.href = kycResult.kycUrl;
    } catch (error) {
      toast({
        title: "Payment Processing Failed",
        description: error instanceof Error ? error.message : "Unable to process payment. Please try again.",
        variant: "destructive"
      });
      setStep('confirm');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Money Sent!</h2>
            <p className="text-gray-600 mb-6">
              {amount} {fromCurrency} has been sent to {recipientName}
            </p>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-900 mb-2">Transaction Details:</h3>
              <div className="text-sm text-green-700 space-y-1">
                <div>Amount sent: {amount} {fromCurrency}</div>
                <div>Recipient gets: {getConvertedAmount()} {toCurrency}</div>
                <div>Fee: ${getFee()} XLM</div>
                <div>Delivery time: {getDeliveryTime()}</div>
                <div>Transaction ID: TX{Date.now()}</div>
              </div>
            </div>

            {/* Recipient Experience Status */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-primary mb-2">Recipient Notification:</h3>
              {recipient.includes('@') ? (
                <div className="flex items-center space-x-2 text-primary/80 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Push notification sent to existing fi.plus user</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-primary/80 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS with claim link sent to {recipient}</span>
                  </div>
                  <div className="text-xs text-primary/70 italic bg-primary/5 p-2 rounded">
                    "You've received {getConvertedAmount()} {toCurrency} from {user?.firstName}. 
                    Claim at: fi.plus/claim?id=ABC123"
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button variant="outline" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>SMS</span>
              </Button>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full minimal-button"
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center minimal-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Send className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Sending Money</h2>
            <p className="text-muted-foreground mb-4">
              Processing your transfer via Stellar network...
            </p>
            <div className="text-sm text-muted-foreground">
              Settlement in progress
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Star className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">fi.plus</h1>
              </div>
              <Button variant="ghost" onClick={() => setStep('form')}>
                Back
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="text-foreground">Confirm Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {amount} {fromCurrency}
                </div>
                <div className="text-lg text-muted-foreground">
                  → {getConvertedAmount()} {toCurrency}
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span className="font-medium text-foreground">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium text-foreground">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange rate:</span>
                  <span className="text-foreground">1 {fromCurrency} = {calculateExchangeRate()} {toCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="text-foreground">${getFee()} XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery time:</span>
                  <span className="text-foreground">{getDeliveryTime()}</span>
                </div>
                {message && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground">Message:</span>
                    <div className="text-sm mt-1 text-foreground">{message}</div>
                  </div>
                )}
              </div>

              <Button 
                onClick={confirmSend}
                className="w-full minimal-button"
                size="lg"
              >
                Confirm & Send
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <header className="bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">fi.plus</h1>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="lg:ml-64 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Send Money</h1>
          <p className="text-xl text-muted-foreground">
            Fast, secure cross-border payments via Stellar network
          </p>
        </div>

        <Card className="minimal-card">
          <CardHeader>
            <CardTitle className="text-foreground">Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount and Currencies */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg sm:text-xl font-bold minimal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">From</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="minimal-input">
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
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">To</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="minimal-input">
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
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-primary">Recipient will receive:</span>
                  <span className="text-xl font-bold text-primary">
                    {getConvertedAmount()} {toCurrency}
                  </span>
                </div>
                <div className="text-sm text-primary/80 mt-2">
                  Rate: 1 {fromCurrency} = {calculateExchangeRate()} {toCurrency}
                </div>
              </div>
            )}

            {/* Recipient Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Recipient Name</label>
                <Input
                  placeholder="Full name of recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="minimal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Recipient Contact</label>
                <Input
                  placeholder="Phone number, email, or wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="minimal-input"
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-sm font-medium mb-4 text-foreground">Delivery Method</label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="radio"
                    id="wallet"
                    name="delivery"
                    value="wallet"
                    checked={deliveryMethod === 'wallet'}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="wallet"
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      deliveryMethod === 'wallet'
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-foreground">fi.plus Wallet</div>
                        <div className="text-sm text-muted-foreground">Instant delivery to recipient's wallet</div>
                      </div>
                      <Badge variant="outline">3-5 seconds</Badge>
                    </div>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    id="bank"
                    name="delivery"
                    value="bank"
                    checked={deliveryMethod === 'bank'}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="bank"
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      deliveryMethod === 'bank'
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-foreground">Bank Account</div>
                        <div className="text-sm text-muted-foreground">Direct deposit to bank account</div>
                      </div>
                      <Badge variant="outline">1-3 hours</Badge>
                    </div>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    id="mobile_money"
                    name="delivery"
                    value="mobile_money"
                    checked={deliveryMethod === 'mobile_money'}
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="mobile_money"
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      deliveryMethod === 'mobile_money'
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-foreground">Mobile Money</div>
                        <div className="text-sm text-muted-foreground">M-Pesa, UPI, or other mobile payment</div>
                      </div>
                      <Badge variant="outline">5-15 minutes</Badge>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Optional Message */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message for the recipient"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="minimal-input"
              />
            </div>

            <Button 
              onClick={handleSendMoney}
              disabled={!amount || !recipient || !recipientName}
              className="w-full minimal-button"
              size="lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Review Transfer
            </Button>
          </CardContent>
        </Card>
      </main>
      <MobileNavigation />
    </div>
  );
}