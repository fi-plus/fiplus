import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@shared/schema";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'processing':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusIcon = (type: string, status: string) => {
  if (status === 'processing') {
    return <Clock className="text-yellow-600 text-sm w-4 h-4" />;
  }
  
  return type === 'send' ? 
    <ArrowUp className="text-green-600 text-sm w-4 h-4" /> : 
    <ArrowDown className="text-blue-600 text-sm w-4 h-4" />;
};

export default function RecentActivity() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    staleTime: 30 * 1000, // 30 seconds
  });

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <Card className="bg-white card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {getStatusIcon(transaction.type, transaction.status)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {transaction.type === 'send' ? `Sent to ${transaction.recipientName || transaction.recipientEmail}` : 'Received'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt!).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {transaction.type === 'send' ? '-' : '+'}
                    {transaction.toCurrency} {parseFloat(transaction.toAmount || "0").toLocaleString()}
                  </p>
                  <p className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
