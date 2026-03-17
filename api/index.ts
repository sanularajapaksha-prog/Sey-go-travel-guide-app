import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await registerRoutes(null as any, app);
    // Error handler must be registered after routes
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      if (res.headersSent) return next(err);
      return res.status(status).json({ message });
    });
    initialized = true;
  }
}

export default async function handler(req: Request, res: Response) {
  await ensureInitialized();
  return app(req, res);
}
