import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import Convert from "@/pages/convert";
import History from "@/pages/history";
import Contacts from "@/pages/contacts";
import Settings from "@/pages/settings";
import WalletConnect from "@/pages/wallet-connect";
import KYCVerification from "@/pages/kyc-verification";

import SendMoney from "@/pages/send-money";
import Claim from "@/pages/claim";
import AddBankAccount from "@/pages/add-bank-account";

import UniversalConvert from "@/pages/universal-convert";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  // Check if user needs to connect wallet first
  if (!user.stellarWalletCreated) {
    return <WalletConnect />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/convert">
        <ProtectedRoute>
          <Convert />
        </ProtectedRoute>
      </Route>
      <Route path="/universal-convert">
        <ProtectedRoute>
          <UniversalConvert />
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      </Route>
      <Route path="/contacts">
        <ProtectedRoute>
          <Contacts />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/kyc">
        <ProtectedRoute>
          <KYCVerification />
        </ProtectedRoute>
      </Route>

      <Route path="/send">
        <ProtectedRoute>
          <SendMoney />
        </ProtectedRoute>
      </Route>
      <Route path="/add-bank-account">
        <ProtectedRoute>
          <AddBankAccount />
        </ProtectedRoute>
      </Route>
      <Route path="/claim" component={Claim} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
