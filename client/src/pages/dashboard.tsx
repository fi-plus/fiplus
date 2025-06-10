import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, History, Users, Settings, ArrowUpRight, ArrowDownLeft, Copy, Plus, DollarSign, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { SUPPORTED_CURRENCIES, getExchangeRate } from "@/lib/constants";
import { walletService } from "@/lib/walletService";
import { transactionService } from "@/lib/transactionService";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");

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
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Stellar Network</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
              <Button variant="outline" onClick={logout} className="text-gray-600 border-gray-300">
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
            <Card className="shadow-lg border-0 overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <CardTitle className="text-3xl font-bold mb-2">Send Money Globally</CardTitle>
                <p className="text-blue-100 text-lg">Fast, secure cross-border payments via Stellar network</p>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">From Currency</label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger className="h-14 border-gray-300 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-3">
                              <span className="text-xl">{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-gray-500">{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">To Currency</label>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="h-14 border-gray-300 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className="flex items-center space-x-3">
                              <span className="text-xl">{currency.flag}</span>
                              <span className="font-medium">{currency.code}</span>
                              <span className="text-gray-500">{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Amount to Send</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="h-16 text-3xl font-bold border-gray-300 pr-20"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-medium text-gray-500">
                      {fromCurrency}
                    </div>
                  </div>
                </div>

                {sendAmount && parseFloat(sendAmount) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Recipient will receive:</span>
                      <span className="text-2xl font-bold text-green-800">
                        {(parseFloat(sendAmount) * getExchangeRate(fromCurrency, toCurrency)).toLocaleString()} {toCurrency}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Rate: 1 {fromCurrency} = {getExchangeRate(fromCurrency, toCurrency)} {toCurrency} • Updated now
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSendMoney}
                  disabled={!sendAmount || parseFloat(sendAmount) <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-6 text-xl rounded-xl shadow-lg disabled:opacity-50"
                  size="lg"
                >
                  <Send className="w-6 h-6 mr-3" />
                  Send Money
                </Button>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-green-600">$0.000005</div>
                    <div className="text-sm text-gray-500">Network Fee</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-blue-600">3-5s</div>
                    <div className="text-sm text-gray-500">Settlement</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-500">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balances */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">Your Wallet</span>
                  <Button variant="ghost" size="sm" onClick={copyWalletAddress} className="text-gray-600 hover:text-blue-600">
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Enhanced balance display with better visual hierarchy */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                  <div className="relative p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-blue-100">Available Balance</div>
                        <div className="text-3xl font-bold tracking-tight">
                          ${walletBalances.data ? 
                            (Array.isArray(walletBalances.data) ? 
                              walletBalances.data.reduce((sum: number, wallet: any) => sum + parseFloat(wallet.balance || 0), 0).toFixed(2) 
                              : '0.00') 
                            : '0.00'}
                        </div>
                        <div className="text-xs text-blue-200">USD equivalent</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-200">Ready for instant transfers worldwide</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced multi-currency support card */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-800">Global Reach</div>
                      <div className="text-sm text-emerald-700">Send to 150+ countries in local currencies</div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Auto-conversion • Live rates • Minimal fees
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link href="/add-money">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg shadow-md">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                  </Link>
                  <Link href="/cashout">
                    <Button variant="outline" className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-3 rounded-lg">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Cash Out
                    </Button>
                  </Link>
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