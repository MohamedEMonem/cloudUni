import dotenv from "dotenv";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { resolveTenant } from "./middleware/tenant.middleware.js";
import { sendSuccess, sendError, sendNotFound } from "./utils/response.js";
import { productRoutes } from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import storeRouter from "./routes/storeRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger-output.json" with { type: "json" };

// @ts-ignore
import cors from "cors";

dotenv.config();
const app = express();
// const uploadRoutes = require('./routes/upload.js');

const normalizeOrigin = (origin: string) => {
  const trimmedOrigin = origin.trim();

  try {
    const url = new URL(trimmedOrigin);

    if (
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    ) {
      url.port = "";
    }

    return url.origin;
  } catch {
    return trimmedOrigin;
  }
};

const stripWrappingQuotes = (value: string | undefined) => (value ? value.replace(/^['\"]|['\"]$/g, "").trim() : "");

const configuredOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
  .filter(Boolean)
  .map(stripWrappingQuotes)
  .join(",");

const allowedOrigins = new Set(
  (configuredOrigins || "http://localhost:5000")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//npm install corsconfigured for development, in production we will use nginx to handle cors
app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

app.get("/api/health", (req, res) => {
  return sendSuccess(
    res,
    {
      status: "OK",
      timestamp: new Date().toISOString(),
    },
    "Server is healthy",
  );
});
app.use("/api/stores/:storeSlug/products", resolveTenant, productRoutes);
app.use("/api/stores/:storeSlug/categories", resolveTenant, categoryRoutes);
app.use("/api/stores/:storeSlug/cart", resolveTenant, cartRoutes);
app.use("/api/stores", storeRouter);

// app.use('/uploads',uploadRoutes);

app.use("/api/auth", authRoutes);
// Error handling middleware for Multer

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;

/* 404 handler — catch unknown routes and return JSON 404 */
app.use((req, res) => {
  sendNotFound(res, `Route ${req.originalUrl} not found`);
});

/* Global error handler (exactly 4 args so Express recognizes it) */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} >>`, err);
  const statusCode = err?.status || err?.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err?.message || "Internal Server Error";
  return sendError(res, message, statusCode);
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT} and listening on 0.0.0.0`);
});
