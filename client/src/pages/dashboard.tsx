import Header from "@/components/Header";
import SendMoneyForm from "@/components/SendMoneyForm";
import WalletBalances from "@/components/WalletBalances";
import RecentActivity from "@/components/RecentActivity";
import ExchangeRates from "@/components/ExchangeRates";
import QuickActions from "@/components/QuickActions";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { totalBalance } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Overview Section */}
        <div className="mb-8">
          <div className="gradient-bg rounded-2xl p-6 text-white card-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-medium opacity-90">Total Balance</h2>
                <p className="text-3xl font-bold mt-1">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm opacity-75 mt-1">Across all currencies</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Button 
                  variant="secondary" 
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 border-0 text-white"
                  onClick={() => document.getElementById('send-money-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Money
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 border-0 text-white"
                  onClick={() => document.getElementById('send-money-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Money
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Send Money Form */}
          <div className="lg:col-span-2" id="send-money-form">
            <SendMoneyForm />
          </div>

          {/* Right Column: Wallet and Activity */}
          <div className="space-y-6">
            <WalletBalances />
            <RecentActivity />
            <QuickActions />
          </div>
        </div>

        {/* Exchange Rates Section */}
        <div className="mt-8">
          <ExchangeRates />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">fi.plus</h3>
              <p className="text-gray-300 text-sm">Making cross-border payments simple, fast, and affordable for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Send Money</a></li>
                <li><a href="#" className="hover:text-white">Receive Money</a></li>
                <li><a href="#" className="hover:text-white">Currency Exchange</a></li>
                <li><a href="#" className="hover:text-white">Business Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Track Transfer</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
                <li><a href="#" className="hover:text-white">Regulatory Info</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 fi.plus. All rights reserved. | Powered by Stellar Network & Onramp.money | Licensed Money Transmitter</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
