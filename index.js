require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./services/dbService");
const prayerTimesRouter = require("./routes/prayerTimes");

const app = express();

app.use(cors());
app.use("/api/v1", prayerTimesRouter);

// Ensure DB is connected before handling any request (safe for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err.message);
    res.status(503).json({ error: "Database unavailable. Please try again." });
  }
});

// Export app for serverless platforms (Vercel, AWS Lambda, etc.)
module.exports = app;

// Start local server when run directly (npm run dev / npm start)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() =>
      app.listen(PORT, () => console.log(`Al-Rayyan API live on port ${PORT}`)),
    )
    .catch((err) => {
      console.error("[MongoDB] Failed to connect:", err.message);
      process.exit(1);
    });
}
