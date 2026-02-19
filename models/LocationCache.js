const mongoose = require("mongoose");

const locationCacheSchema = new mongoose.Schema(
  {
    cityKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    city: { type: String, required: true },
    country_name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timeZone: { type: String, required: true },
    // All IPs that resolved to this city are stored here
    ips: [{ type: String }],
  },
  { timestamps: true },
);

// Index for fast IP-based lookups
locationCacheSchema.index({ ips: 1 });

module.exports = mongoose.model("LocationCache", locationCacheSchema);
