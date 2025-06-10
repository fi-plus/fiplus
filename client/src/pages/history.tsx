import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";
import { useState } from "react";
import type { Transaction } from "@shared/schema";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromCurrency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toCurrency?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "send" ? ArrowUpRight : ArrowDownLeft;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">View and manage all your transactions</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by recipient, currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="send">Sent Money</SelectItem>
                  <SelectItem value="receive">Received Money</SelectItem>
                  <SelectItem value="conversion">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ArrowUpRight className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start sending money to see your transaction history"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const TypeIcon = getTypeIcon(transaction.type);
              return (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === "send" ? "bg-red-100" : "bg-green-100"
                        }`}>
                          <TypeIcon className={`w-5 h-5 ${
                            transaction.type === "send" ? "text-red-600" : "text-green-600"
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {transaction.type === "send" ? "Sent to" : "Received from"} {transaction.recipientName || transaction.recipientEmail || "Unknown"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "Unknown date"} at{" "}
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleTimeString() : "Unknown time"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {transaction.fromAmount ? parseFloat(transaction.fromAmount).toLocaleString() : "0"} {transaction.fromCurrency || "USD"}
                        </p>
                        {transaction.fromCurrency !== transaction.toCurrency && (
                          <p className="text-sm text-gray-500">
                            ≈ {transaction.toAmount ? parseFloat(transaction.toAmount).toLocaleString() : "0"} {transaction.toCurrency || "USD"}
                          </p>
                        )}
                        <div className="mt-1">
                          <Badge className={getStatusColor(transaction.status || "pending")}>
                            {transaction.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}