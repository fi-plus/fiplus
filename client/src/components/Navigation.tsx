import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Home, 
  Send, 
  History, 
  Users, 
  Settings, 
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/send", label: "Send Money", icon: Send },
  { href: "/history", label: "History", icon: History },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/kyc", label: "KYC Verify", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-sm z-30">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">fi.plus</h1>
              <p className="text-xs text-muted-foreground">Cross-border payments</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href === "/" && location === "/");
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-12 ${
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="mt-auto pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}