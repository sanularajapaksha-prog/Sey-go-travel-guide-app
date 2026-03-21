import { Sidebar } from "./Sidebar";
import { NotificationPanel } from "./NotificationPanel";
import { Search, LogOut, User, Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export function Layout({ children, title, action }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-white/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-2xl font-bold font-display text-foreground">{title}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded-full bg-secondary border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all text-sm w-64 outline-none"
              />
            </div>
            
            <NotificationPanel />
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-500 shadow-md ring-2 ring-white cursor-pointer outline-none focus:ring-blue-300 transition-all hover:shadow-lg" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-0 bg-white border border-blue-100 shadow-xl rounded-xl">
                <div className="flex flex-col space-y-1 p-4 border-b border-blue-50 bg-blue-50/30">
                  <p className="text-sm font-semibold text-blue-900">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-blue-600/80">{user?.email || "admin@seygo.com"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Button>
                </div>
                <div className="p-2 border-t border-blue-50">
                  <Button onClick={() => logout()} variant="ghost" className="w-full justify-start text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-end mb-6">
            {action}
          </div>
          <div className="animate-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
