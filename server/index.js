const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { PORT, MONGO_URI } = require("./config/env");

// Route files
const userRoutes = require("./routes/userRoutes");
const historyRoutes = require("./routes/historyRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// app.use(mongoSanitize());
app.use(helmet());
app.use(cors({ origin: "*" }));
// app.use(compression());

// Log incoming requests
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(
    `[${now}] ${req.method} ${req.originalUrl} from ${req.ip} ${
      req.body ? `| Body: ${JSON.stringify(req.body)}` : ""
    }`
  );
  next();
});

app.get("/test", (req, res) => {
  res.send("✅ Server is reachable from your phone");
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/news", newsRoutes);

// Global error handler (example)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// MongoDB connection
mongoose.set("strictQuery", false); // suppress warnings
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});

// Graceful shutdown
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("SIGINT", () => {
  console.log("👋 Shutting down gracefully...");
  server.close(() => process.exit(0));
});
