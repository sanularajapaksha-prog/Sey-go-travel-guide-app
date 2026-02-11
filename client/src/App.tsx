import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

import Dashboard from "@/pages/Dashboard";
import Places from "@/pages/Places";
import AddPlace from "@/pages/AddPlace";
import Playlists from "@/pages/Playlists";
import Users from "@/pages/Users";
import Moderation from "@/pages/Moderation";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/places" component={Places} />
      <Route path="/places/new" component={AddPlace} />
      <Route path="/playlists" component={Playlists} />
      <Route path="/users" component={Users} />
      <Route path="/moderation" component={Moderation} />
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
