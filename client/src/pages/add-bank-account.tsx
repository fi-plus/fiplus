import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, CheckCircle2, ArrowLeft, Globe, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

const SUPPORTED_COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR', banks: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'] },
  { code: 'US', name: 'United States', currency: 'USD', banks: ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank'] },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', banks: ['Barclays', 'HSBC', 'Lloyds', 'NatWest'] },
  { code: 'CA', name: 'Canada', currency: 'CAD', banks: ['Royal Bank of Canada', 'TD Bank', 'Scotiabank', 'BMO'] },
  { code: 'AU', name: 'Australia', currency: 'AUD', banks: ['Commonwealth Bank', 'ANZ', 'Westpac', 'NAB'] },
];

export default function AddBankAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'connect' | 'verify' | 'success'>('select');
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: "",
    routingNumber: "",
    accountType: "checking",
    accountHolderName: ""
  });

  const country = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry);
  const availableBanks = country?.banks || [];

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedBank("");
    setStep('connect');
  };

  const handleBankConnect = () => {
    if (!selectedBank) {
      toast({
        title: "Bank Selection Required",
        description: "Please select your bank to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep('verify');
  };

  const handleAccountVerification = () => {
    if (!accountDetails.accountNumber || !accountDetails.accountHolderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required account details.",
        variant: "destructive",
      });
      return;
    }
    
    setStep('success');
    toast({
      title: "Account Connected Successfully",
      description: `Your ${selectedBank} account has been connected to fi.plus`,
    });
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-4 min-h-screen">
          <Card className="max-w-md w-full text-center minimal-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Account Connected!</h2>
            <p className="text-muted-foreground mb-6">
              Your {selectedBank} account is now connected to fi.plus. You can now send money directly from this account.
            </p>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-400 mb-2">Account Details:</h3>
              <div className="text-sm text-green-400/80 space-y-1">
                <div>Bank: {selectedBank}</div>
                <div>Account: ••••{accountDetails.accountNumber.slice(-4)}</div>
                <div>Currency: {country?.currency}</div>
                <div>Status: Active & Verified</div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/">
                <Button className="w-full minimal-button">
                  Return to Dashboard
                </Button>
              </Link>
              <Link href="/send">
                <Button variant="outline" className="w-full">
                  Send Money Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="lg:ml-64 max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Connect Bank Account</h1>
          <p className="text-muted-foreground">
            Connect your bank account to send money instantly with real-time conversion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'select' && (
              <Card className="minimal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">Select Your Country</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => handleCountrySelect(country.code)}
                        className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-500 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{country.name}</div>
                              <div className="text-sm text-muted-foreground">{country.banks.length} supported banks</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                              {country.currency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'connect' && country && (
              <Card className="minimal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Select Your Bank in {country.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-3">
                    {availableBanks.map((bank) => (
                      <div
                        key={bank}
                        onClick={() => setSelectedBank(bank)}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedBank === bank
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-blue-700 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{bank}</div>
                            <div className="text-sm text-muted-foreground">Instant connection available</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleBankConnect}
                    disabled={!selectedBank}
                    className="w-full mt-6 minimal-button"
                  >
                    Connect to {selectedBank || 'Selected Bank'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'verify' && (
              <Card className="minimal-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Verify Account Details - {selectedBank}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        placeholder="Enter full name as on bank account"
                        value={accountDetails.accountHolderName}
                        onChange={(e) => setAccountDetails({...accountDetails, accountHolderName: e.target.value})}
                        className="mt-1 minimal-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter your account number"
                        value={accountDetails.accountNumber}
                        onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                        className="mt-1 minimal-input"
                      />
                    </div>

                    {country?.code === 'US' && (
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          placeholder="Enter 9-digit routing number"
                          value={accountDetails.routingNumber}
                          onChange={(e) => setAccountDetails({...accountDetails, routingNumber: e.target.value})}
                          className="mt-1 minimal-input"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select 
                        value={accountDetails.accountType} 
                        onValueChange={(value) => setAccountDetails({...accountDetails, accountType: value})}
                      >
                        <SelectTrigger className="mt-1 minimal-input">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAccountVerification}
                    className="w-full minimal-button"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify & Connect Account
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Features */}
            <Card className="minimal-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Bank-Level Security</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Read-only access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-foreground">Regulated by financial authorities</span>
                </div>
              </CardContent>
            </Card>

            {/* Supported Features */}
            <Card className="minimal-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">What You Get</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Instant balance checking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Send to 150+ countries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Real-time currency conversion</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}