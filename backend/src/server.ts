import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import AuthRoutes from "./routes/authRoutes.js";
import DengueRoutes from "./routes/dengueRoutes.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

//* Resolve dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

//* Middleware
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//* API Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/dengue", DengueRoutes);

//* Health check
app.get("/api/health", (_: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

//* Error Handling
app.use(notFound);
app.use(errorHandler);

//* Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./dist")));
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "./dist/index.html"))
  );
}

//* Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
