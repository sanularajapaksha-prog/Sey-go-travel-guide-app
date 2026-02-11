import { Sidebar } from "./Sidebar";
import { Bell, Search } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}

export function Layout({ children, title, action }: LayoutProps) {
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
            
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/20 ring-2 ring-white cursor-pointer" />
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
