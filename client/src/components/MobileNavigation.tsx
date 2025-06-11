import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Send, History, Users, Settings } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 md:hidden z-50">
      <nav className="flex justify-around items-center">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-xs">Home</span>
          </Button>
        </Link>
        <Link href="/send">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${
              isActive("/send") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="text-xs">Send</span>
          </Button>
        </Link>
        <Link href="/history">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${
              isActive("/history") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <History className="w-4 h-4" />
            <span className="text-xs">History</span>
          </Button>
        </Link>
        <Link href="/contacts">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${
              isActive("/contacts") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-xs">Contacts</span>
          </Button>
        </Link>
        <Link href="/settings">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${
              isActive("/settings") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </Button>
        </Link>
      </nav>
    </div>
  );
}