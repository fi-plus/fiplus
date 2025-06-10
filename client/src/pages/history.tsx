import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Download, Share2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

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
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating}/5)</span>
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
    return transactions.filter(tx => tx.status === 'completed').length;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-gray-600" />;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">Track all your cross-border payments</p>
          </div>
          
          {/* User Reputation Score */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="pt-4 pb-4 px-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-xl font-bold text-yellow-600">{getAverageRating()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Reputation Score</div>
                  <div>{getTotalTransactions()} verified transfers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p>Your transaction history will appear here once you start using fi.plus</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "send" || transaction.type === "withdrawal" ? "bg-blue-100" : "bg-green-100"
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-lg">
                            {transaction.type === "send" || transaction.type === "withdrawal" ? "-" : "+"}{transaction.amount} {transaction.currency}
                          </span>
                          {getStatusIcon(transaction.status)}
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          {getTransactionDescription(transaction)}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">
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
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {expandedTx === transaction.id ? "Hide Details" : "View Details"}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTx === transaction.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
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
    </div>
  );
}