import { Layout } from "@/components/Layout";
import { useDashboardStats, useDashboardActivity } from "@/hooks/use-dashboard";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ListMusic, Users, Shield, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) {
  return (
    <Card className="border-none shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold font-display">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${colorClass}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity, isLoading: activityLoading } = useDashboardActivity();

  if (statsLoading || activityLoading) {
    return (
      <Layout title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Trips" 
          value={stats?.totalTrips || 0} 
          icon={TrendingUp} 
          colorClass="bg-blue-500 shadow-blue-500/30 shadow-lg" 
        />
        <StatCard 
          title="Total Playlists" 
          value={stats?.totalPlaylists || 0} 
          icon={ListMusic} 
          colorClass="bg-violet-500 shadow-violet-500/30 shadow-lg" 
        />
        <StatCard 
          title="Active Places" 
          value={stats?.totalPlaces || 0} 
          icon={MapPin} 
          colorClass="bg-emerald-500 shadow-emerald-500/30 shadow-lg" 
        />
        <StatCard 
          title="User Count" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          colorClass="bg-orange-500 shadow-orange-500/30 shadow-lg" 
        />
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-none shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Live monthly activity and user growth from the Supabase database.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <defs>
                    <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPlaylists" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.22}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trips" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTrips)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="playlists" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPlaylists)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    name="User growth"
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Secondary Stats */}
        <Card className="border-none shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[350px]">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
              <div className="bg-yellow-50 rounded-full p-8 relative z-10">
                <Shield className="h-12 w-12 text-yellow-500" />
              </div>
            </div>
            <h3 className="mt-6 text-4xl font-bold text-foreground">{stats?.pendingReviews || 0}</h3>
            <p className="text-muted-foreground mt-2 text-center">Items require your attention</p>
            <button className="mt-6 px-6 py-2 bg-yellow-500 text-white rounded-full font-medium hover:bg-yellow-600 transition-colors shadow-lg shadow-yellow-500/25">
              Review Now
            </button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
