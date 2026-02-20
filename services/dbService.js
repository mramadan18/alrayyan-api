const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;

// Cache the connection promise to avoid reconnecting on every serverless invocation
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(DB_URL, { dbName: "alrayyan" })
      .then(() => console.log("[MongoDB] Connected"))
      .catch((err) => {
        connectionPromise = null; // reset so next request retries
        throw err;
      });
  }

  await connectionPromise;
}

module.exports = { connectDB };
