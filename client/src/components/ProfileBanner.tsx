import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Users, BarChart3 } from "lucide-react";
import type { StatsResponse } from "../../../server/shared/schema";

interface ProfileBannerProps {
  stats?: StatsResponse;
}

export function ProfileBanner({ stats }: ProfileBannerProps) {
  const { user } = useAuth();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Use a stunning high-quality Sri Lanka travel image (Ella/Nine Arch Bridge or a Beach)
  const bgImageUrl = "https://images.unsplash.com/photo-1588598198321-dfca8b18b485?q=80&w=2070";

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl shadow-primary/10 border border-white/20">
      {/* Background Image & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent dark:from-black/95 dark:via-black/70" />
      
      {/* Content Container */}
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-8 h-full">
        
        {/* User Info Section */}
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl">
            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Admin'}&backgroundColor=e2e8f0`} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">{user?.name?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          
          <div className="text-white space-y-1.5">
            <p className="text-white/80 font-medium tracking-wide flex items-center gap-2 text-sm uppercase">
              {greeting}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight drop-shadow-sm">
              Welcome back, {user?.name || "Admin"}
            </h2>
            <div className="flex items-center gap-3 text-white/90">
              <span className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 shadow-sm">
                Super Admin
              </span>
              <span className="text-sm">Manage the SeyGo platform securely.</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats Block */}
        <div className="flex flex-col items-start md:items-end gap-5">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link href="/places/new">
              <Button size="sm" className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium shadow-lg transition-all">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Destination
              </Button>
            </Link>
            <Link href="/users">
              <Button size="sm" variant="secondary" className="backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/10 text-white shadow-lg transition-all">
                <Users className="mr-2 h-4 w-4" /> Manage Users
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="backdrop-blur-md bg-transparent border-white/30 text-white hover:bg-white/10 shadow-lg">
              <BarChart3 className="mr-2 h-4 w-4" /> View Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
