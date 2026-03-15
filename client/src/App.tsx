import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import Dashboard from "@/pages/Dashboard";
import Places from "@/pages/Places";
import AddPlace from "@/pages/AddPlace";
import Playlists from "@/pages/Playlists";
import Users from "@/pages/Users";
import Moderation from "@/pages/Moderation";

function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return <Skeleton className="min-h-screen w-full" />;
        }

        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }

        return <Component />;
      }}
    </Route>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="min-h-screen w-full" />;
  }

  return (
    <Switch>
      <Route path="/login">
        {() => (isAuthenticated ? <Redirect to="/" /> : <Login />)}
      </Route>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/places" component={Places} />
      <ProtectedRoute path="/places/new" component={AddPlace} />
      <ProtectedRoute path="/playlists" component={Playlists} />
      <ProtectedRoute path="/users" component={Users} />
      <ProtectedRoute path="/moderation" component={Moderation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
