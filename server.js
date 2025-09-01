import 'dotenv/config';
import mongoose from "mongoose";
import app from "./app.js";
import { startAutoClearMembersJob } from './src/utils/cron.js';



// Handle unhandled events
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});


// Connect to the database
const DB_URI = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
        startAutoClearMembersJob();
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});