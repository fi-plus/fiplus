import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Download, Share2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

export default function History() {
  const { toast } = useToast();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  
  // Get real transaction data from API
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: () => fetch('/api/transactions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json())
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "failed":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (date: Date | string) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const transactionDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(transactionDate.getTime())) {
      return 'Unknown time';
    }
    
    const diff = now.getTime() - transactionDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating}/5)</span>
      </div>
    );
  };

  const toggleExpanded = (txId: string) => {
    setExpandedTx(expandedTx === txId ? null : txId);
  };

  const getAverageRating = () => {
    const completedTransactions = transactions.filter((tx: any) => tx.status === 'completed');
    if (completedTransactions.length === 0) return "0.0";
    return "5.0"; // Default high rating for completed transactions
  };

  const getTotalTransactions = () => {
    return transactions.filter((tx: any) => tx.status === 'completed').length;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-white" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-white" />;
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-white" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-white" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-white" />;
    }
  };

  const getTransactionDescription = (transaction: any) => {
    switch (transaction.type) {
      case 'send':
        return `To ${transaction.recipientName || 'Recipient'}`;
      case 'receive':
        return 'Received payment';
      case 'deposit':
        return 'Added funds to wallet';
      case 'withdrawal':
        return 'Withdrawn to bank account';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="lg:ml-64 max-w-4xl mx-auto p-4 sm:p-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground mt-1">Track your cross-border payments</p>
          </div>
          
          {/* User Reputation Score */}
          <Card className="minimal-card bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="pt-3 pb-3 px-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold text-yellow-400">{getAverageRating()}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium">Reputation</div>
                  <div>{getTotalTransactions()} transfers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card className="minimal-card text-center py-8">
              <CardContent>
                <div className="text-muted-foreground">
                  <h3 className="text-base font-medium mb-2">No transactions yet</h3>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction: any) => (
              <Card key={transaction.id} className="minimal-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "send" || transaction.type === "withdrawal" ? "bg-primary" : "bg-green-500"
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            {transaction.type === "send" || transaction.type === "withdrawal" ? "-" : "+"}{transaction.amount} {transaction.currency}
                          </span>
                          {getStatusIcon(transaction.status)}
                          <Badge className={getStatusColor(transaction.status)} variant="secondary">
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          {getTransactionDescription(transaction)}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(transaction.timestamp)}
                          </span>
                          {transaction.status === "completed" && (
                            <div className="flex items-center space-x-1">
                              {renderStarRating(5)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(transaction.id)}
                        className="text-muted-foreground hover:text-foreground h-9"
                      >
                        {expandedTx === transaction.id ? "Hide" : "Details"}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTx === transaction.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-[#ffffff]">Transaction Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="font-mono">{transaction.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span>{transaction.amount} {transaction.currency}</span>
                            </div>
                            {transaction.toCurrency && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Converted Amount:</span>
                                <span>{transaction.convertedAmount} {transaction.toCurrency}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fee:</span>
                              <span>{transaction.fee} XLM</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              Download Receipt
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Transaction
                            </Button>
                            {transaction.type === 'send' && (
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                Send Again
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}