import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, CheckCircle2, Camera, CreditCard, User, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

export default function Claim() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'verify' | 'kyc' | 'wallet' | 'complete'>('verify');
  const [claimData, setClaimData] = useState({
    amount: "250.00",
    currency: "USD",
    convertedAmount: "20,780.00",
    toCurrency: "INR",
    sender: "John Smith",
    message: "Happy birthday! 🎉"
  });
  const [progress, setProgress] = useState(25);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    // Simulate claim link validation
    const urlParams = new URLSearchParams(window.location.search);
    const claimId = urlParams.get('id');
    if (!claimId) {
      setLocation('/');
    }
  }, [setLocation]);

  const handleVerifyPhone = () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep('kyc');
    setProgress(50);
  };

  const handleKYCComplete = () => {
    setStep('wallet');
    setProgress(75);
    
    // Simulate wallet creation
    setTimeout(() => {
      setStep('complete');
      setProgress(100);
      
      toast({
        title: "Wallet Created Successfully!",
        description: `Your ${claimData.convertedAmount} ${claimData.toCurrency} is now available.`,
      });
    }, 2000);
  };

  const handleGoToDashboard = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">fi.plus</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Claim Your Money</span>
                </div>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">
              <Gift className="w-4 h-4 mr-1" />
              Money Received
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Money Received Card */}
        <Card className="mb-8 minimal-card overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
            <div className="text-center">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">You've Received Money!</h2>
              <p className="text-green-100">From {claimData.sender}</p>
            </div>
          </div>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-foreground mb-2">
              {claimData.convertedAmount} {claimData.toCurrency}
            </div>
            <div className="text-lg text-muted-foreground mb-4">
              (${claimData.amount} {claimData.currency})
            </div>
            {claimData.message && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                <p className="text-primary italic">"{claimData.message}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Setup Progress</span>
            <span>{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step Content */}
        {step === 'verify' && (
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-6 h-6 text-primary" />
                <span className="text-foreground">Verify Your Phone Number</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                To claim your money and create your fi.plus wallet, we need to verify your identity.
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-lg minimal-input"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-lg minimal-input"
                  />
                </div>
              </div>

              <Button 
                onClick={handleVerifyPhone}
                className="w-full minimal-button font-bold py-4 text-lg"
              >
                Send Verification Code
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'kyc' && (
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-foreground">Quick Identity Verification</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                For security and compliance, we need to verify your identity. This is a one-time process.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Take Selfie</p>
                    <p className="text-xs text-gray-500">Tap to capture</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Scan ID</p>
                    <p className="text-xs text-gray-500">Driver's license or passport</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleKYCComplete}
                disabled={!firstName || !lastName}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 text-lg"
              >
                Complete Verification
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'wallet' && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-blue-600" />
                <span>Creating Your Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Setting up your fi.plus wallet</h3>
              <p className="text-gray-600 mb-6">
                We're creating your secure Stellar wallet and depositing your funds...
              </p>
              <div className="max-w-xs mx-auto">
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span>Welcome to fi.plus!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Wallet Created Successfully!</h3>
                <p className="text-gray-600">
                  Your money has been securely deposited into your new fi.plus wallet.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {claimData.convertedAmount} {claimData.toCurrency}
                </div>
                <div className="text-green-600">Available in your wallet</div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
                >
                  Access Your Wallet
                </Button>
                
                <p className="text-sm text-gray-500">
                  You can now send money worldwide, add more funds, or cash out to your local bank account.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <MobileNavigation />
    </div>
  );
}