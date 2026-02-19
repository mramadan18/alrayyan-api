require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./services/dbService");
const prayerTimesRouter = require("./routes/prayerTimes");

const app = express();

app.use(cors());
app.use("/api/v1", prayerTimesRouter);

const PORT = process.env.PORT;

// Connect to MongoDB first, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Al-Rayyan API live on port ${PORT}`));
  })
  .catch((err) => {
    console.error("[MongoDB] Failed to connect:", err.message);
    process.exit(1);
  });
