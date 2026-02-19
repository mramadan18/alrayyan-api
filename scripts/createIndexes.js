/**
 * Run this script ONCE to create indexes on the location_cache collection.
 * Usage: node scripts/createIndexes.js
 */

require("dotenv").config();
const { connectDB, closeDB, getDB } = require("../services/dbService");

async function main() {
  await connectDB();
  const col = getDB().collection("location_cache");

  await col.createIndex({ cityKey: 1 }, { unique: true, name: "idx_cityKey" });
  await col.createIndex({ ips: 1 }, { name: "idx_ips" });

  console.log("[Indexes] Created successfully on location_cache collection.");
  await closeDB();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
