const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const startServer = async () => {
  try {
    await connectDB(env.mongoUri);

    app.listen(env.port, () => {
      console.log(`Hashnode API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();