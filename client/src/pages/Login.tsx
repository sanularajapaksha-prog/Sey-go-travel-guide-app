import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, LogIn } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-sm" data-testid="card-login">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold" data-testid="text-login-title">
              Seygo Admin
            </CardTitle>
            <CardDescription className="mt-1" data-testid="text-login-description">
              Sign in to continue
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <Button 
            className="w-full h-11 gap-2" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
