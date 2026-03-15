import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MapPin, ListMusic, Users, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Places', href: '/places', icon: MapPin },
  { name: 'Playlists', href: '/playlists', icon: ListMusic },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Moderation', href: '/moderation', icon: Shield },
];

export function Sidebar() {
  const [location, navigate] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-border h-screen sticky top-0">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Seygo Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
