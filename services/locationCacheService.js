const LocationCache = require("../models/LocationCache");

async function getCachedByIp(ip) {
  if (!ip) return null;

  const doc = await LocationCache.findOne({ ips: ip }).lean();
  if (!doc) return null;

  if (!_isValidDoc(doc)) {
    await LocationCache.deleteOne({ _id: doc._id });
    return null;
  }

  return _toMeta(doc);
}

async function getCachedByCity(city) {
  if (!city) return null;

  const doc = await LocationCache.findOne({
    cityKey: city.trim().toLowerCase(),
  }).lean();
  if (!doc) return null;

  if (!_isValidDoc(doc)) {
    await LocationCache.deleteOne({ _id: doc._id });
    return null;
  }

  return _toMeta(doc);
}

async function cacheLocation(ip, locationMeta) {
  const cityKey = locationMeta.city.trim().toLowerCase();

  const update = {
    $set: {
      city: locationMeta.city,
      country_name: locationMeta.country_name,
      latitude: locationMeta.latitude,
      longitude: locationMeta.longitude,
      timeZone: locationMeta.timeZone,
    },
    ...(ip && { $addToSet: { ips: ip } }),
  };

  await LocationCache.findOneAndUpdate({ cityKey }, update, { upsert: true });
}

function _isValidDoc(doc) {
  return (
    doc.city &&
    doc.country_name &&
    doc.timeZone &&
    typeof doc.latitude === "number" &&
    typeof doc.longitude === "number"
  );
}

function _toMeta(doc) {
  return {
    latitude: doc.latitude,
    longitude: doc.longitude,
    timeZone: doc.timeZone,
    city: doc.city,
    country_name: doc.country_name,
  };
}

module.exports = { getCachedByIp, getCachedByCity, cacheLocation };
