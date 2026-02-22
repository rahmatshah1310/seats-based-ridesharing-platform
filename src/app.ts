import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import createError from "http-errors";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Drizzle DB (optional to touch here)
import { connection } from "@/db/db";
import { loggerMiddleware } from "./middlewares/logger.mw";
import { responseMiddleware } from "./middlewares/response.mw";

// Routes
import apiRouter from "./rotues/index";
import webhookRouter from "./rotues/webhook.routes";

const app = express();

// ✅ Optional: simple DB health-check on startup
(async () => {
  try {
    await connection`SELECT 1`; // postgres-js tagged template
    console.log("✅ Database is connected succesfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

app.use(responseMiddleware);

// Body parsers
app.use(
  express.json({
    limit: "200mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "200mb" }));

app.use(loggerMiddleware);

// CORS
app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://68.183.112.7", "http://localhost:5173/"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
// Session
app.use(
  session({
    secret: "secret2024",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req: Request, res: Response) => {
  res.render("index", { title: "seats-based-ridesharing-platform" });
});

// API routes
app.use("/api/v1", apiRouter);
app.use("/api/webhooks", webhookRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`${status} - ${message} - ${req.method} ${req.path}`);

  if (req.path.startsWith("/api")) {
    res.status(status).json({ message, status });
  } else {
    res.status(status).send(message);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  process.exit(0);
});

export default app;
