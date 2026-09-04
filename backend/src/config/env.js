const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
};

if (!env.mongoUri) {
  console.error("MONGODB_URI is not configured.");
  process.exit(1);
}

if (!env.jwtSecret) {
  console.error("JWT_SECRET is not configured.");
  process.exit(1);
}

module.exports = env;