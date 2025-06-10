import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, History, Users, Settings, ArrowUpRight, ArrowDownLeft, Copy, Plus, DollarSign, Globe, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { SUPPORTED_CURRENCIES, getExchangeRate } from "@/lib/constants";
// Services removed - using direct API calls

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");

  // Fetch real transaction data from database
  const transactions = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user
  });

  // Fetch real wallet balances
  const walletBalances = useQuery({
    queryKey: ['/api/wallets'],
    enabled: !!user
  });

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">fi.plus</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Stellar Network</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </div>
              <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Send Money Card */}
          <div className="lg:col-span-2">
            <Card className="minimal-card overflow-hidden">
              <div className="gradient-primary p-6 text-white">
                <CardTitle className="text-2xl font-semibold mb-1">Send Money Globally</CardTitle>
                <p className="text-white/80">Fast, secure cross-border payments via Stellar network</p>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">From</label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="h-12 minimal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground text-sm">{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">To</label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-12 minimal-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-2">
                              <span>{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-muted-foreground text-sm">{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="h-14 text-2xl font-semibold minimal-input pr-16"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      {fromCurrency}
                    </div>
                  </div>
                </div>

                {sendAmount && parseFloat(sendAmount) > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium">Recipient receives:</span>
                      <span className="text-xl font-semibold text-green-400">
                        {(parseFloat(sendAmount) * getExchangeRate(fromCurrency, toCurrency)).toLocaleString()} {toCurrency}
                      </span>
                    </div>
                    <div className="text-sm text-green-400/80 mt-1">
                      Rate: 1 {fromCurrency} = {getExchangeRate(fromCurrency, toCurrency)} {toCurrency}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSendMoney}
                  disabled={!sendAmount || parseFloat(sendAmount) <= 0}
                  className="w-full minimal-button h-12 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Money
                </Button>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold text-green-400">$0.000005</div>
                    <div className="text-xs text-muted-foreground">Network Fee</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold text-primary">3-5s</div>
                    <div className="text-xs text-muted-foreground">Settlement</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold text-purple-400">24/7</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Connected Bank Accounts */}
            <Card className="minimal-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-base font-medium text-foreground">Connected Accounts</span>
                  <Link href="/add-bank-account">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Indian Bank Account */}
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">HDFC Bank</div>
                        <div className="text-xs text-muted-foreground">••••5678</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-foreground">₹2,45,000</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">INR</div>
                    </div>
                  </div>
                </div>

                {/* ICICI Bank Account */}
                <div className="border border-border rounded-lg p-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">ICICI Bank</div>
                        <div className="text-xs text-muted-foreground">••••9876</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-semibold text-foreground">₹1,50,000</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">INR</div>
                    </div>
                  </div>
                </div>

                {/* Add Account Prompt */}
                <div className="border-2 border-dashed border-border rounded-lg p-3 text-center bg-muted">
                  <div className="text-muted-foreground">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium mb-1 text-sm">Add Bank Account</div>
                    <div className="text-xs">50+ countries supported</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="minimal-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-foreground">Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium text-foreground">₹45,000 sent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Transfers</span>
                  <span className="text-sm font-medium text-foreground">23 completed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Rate</span>
                  <span className="text-sm font-medium text-green-400">₹82.45/USD</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <Link href="/history">
                    <Button variant="ghost" className="w-full justify-start h-9 text-left hover:bg-muted transition-colors">
                      <History className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">View All History</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="minimal-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {transactions.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.data.slice(0, 3).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-500' : 'bg-primary'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownLeft className="w-3 h-3 text-white" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground capitalize">{transaction.type}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {transaction.fromAmount} {transaction.fromCurrency}
                            {transaction.toCurrency && ` → ${transaction.toAmount} ${transaction.toCurrency}`}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {transaction.recipientName || transaction.status}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="text-sm">No transactions yet</div>
                    <div className="text-xs mt-1">Start sending money to see activity</div>
                  </div>
                )}
                <Link href="/history">
                  <Button variant="outline" className="w-full mt-3 text-sm h-8">
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