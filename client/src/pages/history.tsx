import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Download, Share2, MessageSquare, Star, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transactionService } from "@/lib/transactionService";

export default function History() {
  const { toast } = useToast();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  
  // Get real transaction data from transactionService
  const transactions = transactionService.getTransactionHistory();

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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const downloadReceipt = (tx: any) => {
    toast({
      title: "Receipt Downloaded",
      description: `Transaction ${tx.txHash} receipt saved to downloads.`,
    });
  };

  const shareViaWhatsApp = (tx: any) => {
    const message = `Money transfer completed!\n\nAmount: ${tx.amount} ${tx.currency}\n${tx.type === 'sent' ? 'Recipient' : 'Sender'}: ${tx.recipient || tx.sender}\nTransaction ID: ${tx.txHash}\n\nPowered by fi.plus`;
    toast({
      title: "Sharing via WhatsApp",
      description: "Opening WhatsApp to share receipt.",
    });
  };

  const shareViaSMS = (tx: any) => {
    const message = `Payment of ${tx.amount} ${tx.currency} ${tx.status}. Transaction: ${tx.txHash}`;
    toast({
      title: "Sharing via SMS",
      description: "Opening SMS to share receipt.",
    });
  };

  const renderStarRating = (rating: number | null) => {
    if (rating === null) return null;
    
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
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    if (completedTransactions.length === 0) return "0.0";
    // For real transactions, we'll use a default rating of 5.0 since rating system isn't implemented yet
    return "5.0";
  };

  const getTotalTransactions = () => {
    return transactions.filter(tx => tx.status === 'completed').length;
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
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "sent" ? "bg-blue-100" : "bg-green-100"
                    }`}>
                      {transaction.type === "sent" ? (
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-lg">
                          {transaction.type === "sent" ? "-" : "+"}{transaction.amount} {transaction.currency}
                        </span>
                        {getStatusIcon(transaction.status)}
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {transaction.type === "sent" 
                          ? `To ${transaction.recipient}` 
                          : `From ${transaction.sender}`
                        }
                        {transaction.toCurrency && (
                          <span className="ml-2">→ {transaction.convertedAmount} {transaction.toCurrency}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{formatTime(transaction.timestamp)}</span>
                        {renderStarRating(transaction.rating)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(transaction.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedTx === transaction.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Transaction Details</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-mono text-xs">{transaction.txHash}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Network Fee:</span>
                            <span>${transaction.fee} XLM</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Settlement Time:</span>
                            <span>3-5 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Blockchain:</span>
                            <span>Stellar Network</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReceipt(transaction)}
                            className="w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Receipt
                          </Button>
                          
                          {transaction.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareViaWhatsApp(transaction)}
                                className="w-full justify-start"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Share via WhatsApp
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => shareViaSMS(transaction)}
                                className="w-full justify-start"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share via SMS
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {MOCK_TRANSACTIONS.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                <p>Your transaction history will appear here once you start sending money.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}