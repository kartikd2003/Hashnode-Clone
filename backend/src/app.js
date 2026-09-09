const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");  
const env = require("./config/env");
const app = express();
const postRoutes = require("./routes/postRoutes");
const tagRoutes = require("./routes/tagRoutes");
const userRoutes = require("./routes/userRoutes");
const engagementRoutes = require("./routes/engagementRoutes");

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/engagement", engagementRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hashnode API is running",
  });
});

app.use(errorMiddleware);

module.exports = app;
