import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, History, Users, Settings, ArrowUpRight, ArrowDownLeft, Copy, Plus, DollarSign, Globe, Building2, Menu, ChevronLeft, Home } from "lucide-react";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">fi.plus</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-border/50 shadow-sm">
                  <span className="text-sm font-semibold text-foreground">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 px-3 py-2 rounded-lg"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden text-xs">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        {/* Left Navigation Sidebar - Hidden on mobile */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-48'} bg-card border-r border-border p-4 transition-all duration-300 ease-in-out hidden md:block`}>
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && <div className="text-xs font-medium text-muted-foreground">Navigation</div>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
          
          <nav className="space-y-1">
            <Link href="/">
              <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-9 text-left bg-muted text-foreground text-sm`}>
                <DollarSign className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
                {!sidebarCollapsed && "Dashboard"}
              </Button>
            </Link>
            <Link href="/send">
              <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-9 text-left hover:bg-muted text-sm`}>
                <Send className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
                {!sidebarCollapsed && "Send Money"}
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-9 text-left hover:bg-muted text-sm`}>
                <History className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
                {!sidebarCollapsed && "History"}
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-9 text-left hover:bg-muted text-sm`}>
                <Users className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
                {!sidebarCollapsed && "Contacts"}
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center px-0' : 'justify-start'} h-9 text-left hover:bg-muted text-sm`}>
                <Settings className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
                {!sidebarCollapsed && "Settings"}
              </Button>
            </Link>
          </nav>
          
          {/* Quick Stats in Sidebar */}
          {!sidebarCollapsed && (
            <div className="mt-6">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Month</span>
                  <span className="text-xs font-medium text-foreground">₹45k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Transfers</span>
                  <span className="text-xs font-medium text-foreground">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Saved</span>
                  <span className="text-xs font-medium text-green-400">₹2.3k</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 md:hidden">
          <nav className="flex justify-around items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
                <Home className="w-4 h-4" />
                <span className="text-xs">Home</span>
              </Button>
            </Link>
            <Link href="/send">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
                <Send className="w-4 h-4" />
                <span className="text-xs">Send</span>
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
                <History className="w-4 h-4" />
                <span className="text-xs">History</span>
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Contacts</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 h-auto py-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </Link>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 pb-20 md:pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Main Send Money Card */}
            <div className="lg:col-span-2">
              <Card className="minimal-card overflow-hidden">
              <div className="gradient-primary p-4 text-white">
                <CardTitle className="text-lg sm:text-xl font-semibold mb-1">Send Money Globally</CardTitle>
                <p className="text-white/80 text-sm">Fast, secure cross-border payments via Stellar network</p>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="h-12 text-lg sm:text-xl font-semibold minimal-input pr-16"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      {fromCurrency}
                    </div>
                  </div>
                </div>

                {sendAmount && parseFloat(sendAmount) > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-medium text-sm">Recipient receives:</span>
                      <span className="text-lg font-semibold text-green-400">
                        {(parseFloat(sendAmount) * getExchangeRate(fromCurrency, toCurrency)).toLocaleString()} {toCurrency}
                      </span>
                    </div>
                    <div className="text-xs text-green-400/80 mt-1">
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

                <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-sm sm:text-base font-semibold text-green-400">$0.000005</div>
                    <div className="text-xs text-muted-foreground">Network Fee</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-sm sm:text-base font-semibold text-primary">3-5s</div>
                    <div className="text-xs text-muted-foreground">Settlement</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-sm sm:text-base font-semibold text-purple-400">24/7</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Transactions Card */}
            <Card className="minimal-card mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Recent Transactions</span>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 text-xs">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {transactions.isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.data.slice(0, 4).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500' : 'bg-primary'
                          }`}>
                            {transaction.type === 'deposit' ? (
                              <ArrowDownLeft className="w-3 h-3 text-white" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground capitalize">{transaction.type}</div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.fromAmount} {transaction.fromCurrency}
                              {transaction.toCurrency && ` → ${transaction.toCurrency}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">
                            {transaction.fromAmount} {transaction.fromCurrency}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
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
              </CardContent>
            </Card>
            

          </div>

            {/* Right Sidebar - Stacked on mobile */}
            <div className="space-y-3 lg:block">
              {/* Connected Bank Accounts */}
              <Card className="minimal-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Connected Accounts</span>
                    <Link href="/add-bank-account">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                {/* Indian Bank Account */}
                <div className="border border-border rounded-lg p-2 bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-xs">HDFC Bank</div>
                        <div className="text-xs text-muted-foreground">••••5678</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs h-5">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-foreground">₹2,45,000</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="text-xs font-medium text-foreground">INR</div>
                  </div>
                </div>

                {/* ICICI Bank Account */}
                <div className="border border-border rounded-lg p-2 bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                        <Building2 className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-xs">ICICI Bank</div>
                        <div className="text-xs text-muted-foreground">••••9876</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs h-5">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-foreground">₹1,50,000</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="text-xs font-medium text-foreground">INR</div>
                  </div>
                </div>

                  {/* Add Account Prompt */}
                  <div className="border-2 border-dashed border-border rounded-lg p-2 text-center bg-muted">
                    <div className="text-muted-foreground">
                      <Plus className="w-4 h-4 mx-auto mb-1" />
                      <div className="font-medium mb-1 text-xs">Add Bank Account</div>
                      <div className="text-xs">50+ countries supported</div>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  {transactions.data && Array.isArray(transactions.data) && transactions.data.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Transaction Summary</div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Total Transactions</span>
                          <span className="text-xs font-medium text-foreground">{transactions.data.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Latest Amount</span>
                          <span className="text-xs font-medium text-foreground">
                            {transactions.data[0]?.fromAmount} {transactions.data[0]?.fromCurrency}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Security & Support */}
              <Card className="minimal-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Security & Support</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs text-green-400">Account Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs text-blue-400">2FA Enabled</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start h-7 text-left hover:bg-muted text-xs">
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