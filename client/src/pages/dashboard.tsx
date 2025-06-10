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
          <div className="space-y-6">
            {/* Connected Bank Accounts */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">Connected Accounts</span>
                  <Link href="/add-bank-account">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Account
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Indian Bank Account */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">HDFC Bank</div>
                        <div className="text-sm text-gray-600">••••5678 (Primary)</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">₹2,45,000</div>
                      <div className="text-sm text-gray-600">Available balance</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">INR</div>
                      <div className="text-xs text-gray-500">Indian Rupee</div>
                    </div>
                  </div>
                </div>

                {/* US Bank Account */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">ICICI Bank</div>
                        <div className="text-sm text-gray-600">••••9876 (Savings)</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">₹1,50,000</div>
                      <div className="text-sm text-gray-600">Available balance</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">INR</div>
                      <div className="text-xs text-gray-500">Indian Rupee</div>
                    </div>
                  </div>
                </div>

                {/* Add Account Prompt */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                  <div className="text-gray-600">
                    <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="font-medium mb-1">Add Another Bank Account</div>
                    <div className="text-sm">Connect accounts from 50+ countries</div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/history">
                  <Button variant="ghost" className="w-full justify-start h-12 text-left hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <History className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium">Transaction History</span>
                  </Button>
                </Link>
                <Link href="/contacts">
                  <Button variant="ghost" className="w-full justify-start h-12 text-left hover:bg-green-50 hover:text-green-600 transition-colors">
                    <Users className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium">Manage Contacts</span>
                  </Button>
                </Link>
                <Link href="/convert">
                  <Button variant="ghost" className="w-full justify-start h-12 text-left hover:bg-purple-50 hover:text-purple-600 transition-colors">
                    <ArrowUpRight className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium">Convert Currency</span>
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="w-full justify-start h-12 text-left hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    <Settings className="w-5 h-5 mr-3 text-gray-600" />
                    <span className="font-medium">Settings</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b">
                <CardTitle className="text-lg font-bold text-gray-800">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {transactions.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.data.slice(0, 2).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                          transaction.type === 'deposit' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowDownLeft className="w-5 h-5 text-white" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800 capitalize">{transaction.type}</div>
                          <div className="text-xs text-gray-600">
                            {transaction.fromAmount} {transaction.fromCurrency}
                            {transaction.toCurrency && ` → ${transaction.toAmount} ${transaction.toCurrency}`}
                          </div>
                          <div className={`text-xs font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'}`}>
                            {transaction.recipientName || transaction.status}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No transactions yet</div>
                    <div className="text-xs mt-1">Your transaction history will appear here</div>
                  </div>
                )}
                <Link href="/history">
                  <Button variant="outline" className="w-full mt-4 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium">
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