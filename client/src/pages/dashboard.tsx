import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, History, Users, Settings, ArrowUpRight, ArrowDownLeft, Copy, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸", stablecoin: "USDC" },
  { code: "EUR", name: "Euro", flag: "🇪🇺", stablecoin: "EURC" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", stablecoin: "GBPC" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", stablecoin: "INRC" },
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬", stablecoin: "NGNC" },
  { code: "KES", name: "Kenyan Shilling", flag: "🇰🇪", stablecoin: "KESC" },
];

const MOCK_BALANCES = {
  USDC: "1,250.00",
  EURC: "890.50", 
  XLM: "100.00"
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

  const handleSendMoney = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to send.",
        variant: "destructive",
      });
      return;
    }
    // Navigate to send money form with pre-filled data
    window.location.href = `/send?from=${fromCurrency}&to=${toCurrency}&amount=${sendAmount}`;
  };

  const copyWalletAddress = () => {
    const address = `GCEXAMPLE${user?.id}STELLARKEY`;
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Stellar wallet address copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">fi.plus</h1>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </div>
              <Button variant="ghost" onClick={logout} className="text-gray-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Send Money Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Send Money Globally</CardTitle>
                <p className="text-blue-100">Fast, secure cross-border payments with Stellar</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-2 block">From</label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-100 mb-2 block">To</label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-blue-100 mb-2 block">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 text-2xl font-bold"
                  />
                </div>

                <Button 
                  onClick={handleSendMoney}
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-4 text-lg"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Money
                </Button>

                <div className="flex justify-between text-sm text-blue-100">
                  <span>Fee: $0.000005</span>
                  <span>Settlement: 3-5 seconds</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Your Wallet</span>
                  <Button variant="ghost" size="sm" onClick={copyWalletAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(MOCK_BALANCES).map(([asset, balance]) => (
                  <div key={asset} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">{asset}</span>
                      </div>
                      <span className="font-medium">{asset}</span>
                    </div>
                    <span className="font-bold">{balance}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/history">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="w-4 h-4 mr-3" />
                    Transaction History
                  </Button>
                </Link>
                <Link href="/contacts">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-3" />
                    Manage Contacts
                  </Button>
                </Link>
                <Link href="/convert">
                  <Button variant="ghost" className="w-full justify-start">
                    <ArrowUpRight className="w-4 h-4 mr-3" />
                    Convert Currency
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Received</div>
                      <div className="text-xs text-gray-500">+$500.00 USDC</div>
                    </div>
                    <div className="text-xs text-gray-500">2h ago</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Sent</div>
                      <div className="text-xs text-gray-500">-$250.00 USDC</div>
                    </div>
                    <div className="text-xs text-gray-500">1d ago</div>
                  </div>
                </div>
                <Link href="/history">
                  <Button variant="link" className="w-full mt-3 text-blue-600">
                    View All Transactions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}