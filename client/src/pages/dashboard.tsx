import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, History, Users, Settings, ArrowUpRight, ArrowDownLeft, Copy, Plus, DollarSign, Globe, Building2, Home, LogOut, Bell, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileNavigation from "@/components/MobileNavigation";
import Navigation from "@/components/Navigation";

import { SUPPORTED_CURRENCIES, getExchangeRate } from "@/lib/constants";
// Services removed - using direct API calls

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");


  // Fetch real transaction data from database
  const transactions = useQuery<any[]>({
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
      <Navigation />
      <main className="md:ml-64">

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Send Money Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="minimal-card overflow-hidden">
                <div className="gradient-primary p-6 text-white">
                  <CardTitle className="text-xl font-bold mb-2">Send Money Globally</CardTitle>
                  <p className="text-white/90 text-sm">Fast, secure cross-border payments via Stellar network</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 block">From</label>
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
                      <label className="text-sm font-semibold text-foreground mb-3 block">To</label>
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
                    <label className="text-sm font-semibold text-foreground mb-3 block">Amount</label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="h-12 text-lg font-semibold minimal-input pr-16"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        {fromCurrency}
                      </div>
                    </div>
                  </div>

                  {sendAmount && parseFloat(sendAmount) > 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-semibold text-sm">Recipient receives:</span>
                        <span className="text-lg font-bold text-green-400">
                          {(parseFloat(sendAmount) * getExchangeRate(fromCurrency, toCurrency)).toLocaleString()} {toCurrency}
                        </span>
                      </div>
                      <div className="text-xs text-green-400/80 mt-2">
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

                  <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t border-border">
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-green-400">$0.000005</div>
                      <div className="text-xs text-muted-foreground">Network Fee</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-primary">3-5s</div>
                      <div className="text-xs text-muted-foreground">Settlement</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-base font-bold text-purple-400">24/7</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
              </CardContent>
            </Card>
            
              {/* Recent Transactions Card */}
              <Card className="minimal-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">Recent Transactions</span>
                    <Link href="/history">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                {transactions.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.data.slice(0, 4).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500' : 'bg-primary'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownLeft className="w-4 h-4 text-white" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-foreground capitalize">{transaction.type}</div>
                            <div className="text-xs text-muted-foreground">
                              {(parseFloat(transaction.fromAmount) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.fromCurrency}
                              {transaction.toCurrency && ` → ${transaction.toCurrency}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            {(parseFloat(transaction.fromAmount) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {transaction.fromCurrency}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm font-medium">No transactions yet</div>
                    <div className="text-xs mt-1">Start sending money to see activity</div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>

            {/* Right Sidebar - Stacked on mobile */}
            <div className="space-y-6">
              {/* Connected Bank Accounts */}
              <Card className="minimal-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">Connected Accounts</span>
                    <Link href="/add-bank-account">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 pb-6">
                  <div className="border border-border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">HDFC Bank</div>
                          <div className="text-xs text-muted-foreground">••••5678</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs h-6">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-foreground">₹2,45,000</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                      <div className="text-xs font-semibold text-foreground">INR</div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">ICICI Bank</div>
                          <div className="text-xs text-muted-foreground">••••9876</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs h-6">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-foreground">₹1,50,000</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                      <div className="text-xs font-semibold text-foreground">INR</div>
                    </div>
                  </div>

                  {(() => {
                    const txData = transactions?.data;
                    if (txData && Array.isArray(txData) && txData.length > 0) {
                      return (
                        <div className="pt-3 border-t border-border">
                          <div className="text-xs font-medium text-muted-foreground mb-2">Transaction Summary</div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Total Transactions</span>
                              <span className="text-xs font-medium text-foreground">{txData.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Latest Amount</span>
                              <span className="text-xs font-medium text-foreground">
                                {(parseFloat(txData[0]?.fromAmount || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {txData[0]?.fromCurrency}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                </CardContent>
              </Card>

              {/* Security & Support */}
              <Card className="minimal-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-foreground">Security & Support</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 pb-6">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold text-green-400">Account Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm font-semibold text-blue-400">2FA Enabled</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start h-10 text-left hover:bg-muted text-sm font-medium">
                      <span>Help & Support</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}