const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;

/**
 * Connects to MongoDB using Mongoose (called once at server startup).
 */
async function connectDB() {
  await mongoose.connect(DB_URL, { dbName: "alrayyan" });
  console.log("[MongoDB] Connected via Mongoose");
}

module.exports = { connectDB };
