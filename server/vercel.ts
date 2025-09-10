import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize routes
let server: any = null;

(async () => {
  try {
    server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }

    // For Vercel, we don't need to listen on a port
    if (process.env.VERCEL !== "1") {
      const port = parseInt(process.env.PORT || '5000', 10);
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();

// Export for Vercel
export default app;
