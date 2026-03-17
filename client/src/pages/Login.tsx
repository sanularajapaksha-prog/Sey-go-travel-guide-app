import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Lock, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error ? error.message : "Unable to sign in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_30%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_45%,#e0f2fe_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm font-medium text-sky-700 backdrop-blur">
              <MapPin className="h-4 w-4" />
              Seygo Admin Console
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-slate-900">
              Manage places, users, and moderation from one admin workspace.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
              Sign in to access the Supabase-backed dashboard, monitor user growth, and manage travel content.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                <p className="text-sm text-slate-500">Access</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">Admin</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                <p className="text-sm text-slate-500">Database</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">Supabase</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg shadow-sky-100/50 backdrop-blur">
                <p className="text-sm text-slate-500">Modules</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">5</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md border-white/70 bg-white/85 shadow-2xl shadow-sky-100/80 backdrop-blur" data-testid="card-login">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-cyan-200">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900" data-testid="text-login-title">
                Sign in to Seygo Admin
              </CardTitle>
              <CardDescription className="mt-2 text-slate-600" data-testid="text-login-description">
                Use the admin credentials to open the dashboard.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    placeholder="admin@seygo.com"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 pl-10"
                    placeholder="Enter password"
                    data-testid="input-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base shadow-lg shadow-cyan-200"
                disabled={isSubmitting}
                data-testid="button-login"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Supabase Auth</p>
              <p className="mt-1">
                Sign in with an email/password user created in your Supabase project.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
