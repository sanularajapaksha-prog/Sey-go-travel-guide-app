import type { Request, Response, NextFunction } from "express";
import { supabase } from "./supabase";
import { pool } from "./db";

// Routes that do NOT require admin authentication
const PUBLIC_ROUTES: { method: string; path: string }[] = [
  { method: "GET",  path: "/api/auth/me" },
  { method: "POST", path: "/api/reviews" },          // mobile: submit review
  { method: "GET",  path: "/api/community/reviews" }, // mobile: read approved reviews
];

function isPublicRoute(method: string, path: string): boolean {
  return PUBLIC_ROUTES.some(
    (r) => r.method === method && path.startsWith(r.path),
  );
}

export async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Only guard /api/* routes
  if (!req.path.startsWith("/api/")) {
    next();
    return;
  }

  // Let public routes through
  if (isPublicRoute(req.method, req.path)) {
    next();
    return;
  }

  const authHeader = (req.headers.authorization as string) ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: no token provided" });
    return;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.email) {
      res.status(401).json({ message: "Unauthorized: invalid token" });
      return;
    }

    let role: string | null = null;
    try {
      const result = await pool.query(
        `SELECT role FROM public.users WHERE email = $1 LIMIT 1`,
        [user.email],
      );
      role = result.rows[0]?.role ?? null;
    } catch {
      role = null;
    }

    if (role !== "admin") {
      res.status(403).json({ message: "Forbidden: admin access required" });
      return;
    }

    // Attach verified admin email so route handlers can use it (e.g. approvedBy)
    (req as any).adminEmail = user.email;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized: token verification failed" });
  }
}
