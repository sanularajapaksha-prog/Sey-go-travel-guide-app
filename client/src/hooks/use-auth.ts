import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { hasSupabaseClientConfig, supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type AuthUser = {
  email: string;
  name: string;
};

async function verifyAdminRole(email: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured.");

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("email", email)
    .single();

  if (error || !data) {
    await supabase.auth.signOut();
    throw new Error("Access denied. Admin only.");
  }

  if (data.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("Access denied. Admin only.");
  }
}

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: SupabaseUser | null): AuthUser | null {
  if (!user?.email) return null;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return {
    email: user.email,
    name: fullName || user.email.split("@")[0] || "Admin User",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error || !data.session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        await verifyAdminRole(data.session.user.email!);
        if (mounted) setUser(toAuthUser(data.session.user));
      } catch {
        if (mounted) setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user?.email) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        await verifyAdminRole(session.user.email);
        setUser(toAuthUser(session.user));
      } catch {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login: async ({ email, password }) => {
        if (!supabase || !hasSupabaseClientConfig) {
          throw new Error(
            "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env for Supabase Auth.",
          );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        await verifyAdminRole(data.user.email!);

        setUser(toAuthUser(data.user));
      },
      logout: async () => {
        if (!supabase) {
          setUser(null);
          return;
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
