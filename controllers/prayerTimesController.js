const adhan = require("adhan");
const moment = require("moment-timezone");
const { getUserLocation } = require("../services/geoService");
const { getCoordinates } = require("../services/nominatimService");
const {
  getCachedByIp,
  getCachedByCity,
  cacheLocation,
} = require("../services/locationCacheService");
const calculationMethods = require("../config/calculationMethods");

const FALLBACK_IP = process.env.DEV_FALLBACK_IP;

function buildCalculationParams(method = "EGYPT", madhab = "SHAFI") {
  const params =
    calculationMethods[method.toUpperCase()] ||
    adhan.CalculationMethod.Egyptian();

  params.madhab =
    madhab.toUpperCase() === "HANAFI"
      ? adhan.Madhab.Hanafi
      : adhan.Madhab.Shafi;

  return params;
}

function formatPrayerTimings(prayerTimes, timeZone) {
  const fmt = (t) => moment(t).tz(timeZone).format("HH:mm");
  return {
    Fajr: fmt(prayerTimes.fajr),
    Sunrise: fmt(prayerTimes.sunrise),
    Dhuhr: fmt(prayerTimes.dhuhr),
    Asr: fmt(prayerTimes.asr),
    Maghrib: fmt(prayerTimes.maghrib),
    Isha: fmt(prayerTimes.isha),
  };
}

async function resolveLocation(req) {
  const { lat, lon, timezone, city, country } = req.query;

  // Option 1: explicit coordinates
  if (lat && lon) {
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      timeZone: timezone || "UTC",
      city: city || "Unknown",
      country_name: country || "Unknown",
    };
  }

  // Option 2: resolve from IP with cache
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "127.0.0.1") ip = FALLBACK_IP;

  // 2a: cache hit by IP
  const byIp = await getCachedByIp(ip);
  if (byIp) return byIp;

  // 2b: resolve city from IP via GeoIP API
  const geoData = await getUserLocation(ip);
  if (!geoData?.city) return null;

  // 2c: cache hit by city
  const byCity = await getCachedByCity(geoData.city);
  if (byCity) {
    await cacheLocation(ip, byCity); // link IP to existing city entry
    return byCity;
  }

  // 2d: resolve coordinates from Nominatim
  const coords = await getCoordinates(geoData.city, geoData.country_name);
  if (!coords) return null;

  const locationMeta = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    timeZone: geoData.time_zone?.name || "UTC",
    city: geoData.city,
    country_name: geoData.country_name,
  };

  await cacheLocation(ip, locationMeta);
  return locationMeta;
}

async function getPrayerTimes(req, res) {
  try {
    const { method, madhab } = req.query;

    const locationMeta = await resolveLocation(req);

    if (!locationMeta) {
      return res.status(503).json({
        error:
          "Could not determine location. Please provide lat and lon manually.",
      });
    }

    const coordinates = new adhan.Coordinates(
      locationMeta.latitude,
      locationMeta.longitude,
    );
    const params = buildCalculationParams(method, madhab);

    const adjustments = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    adjustments.forEach((prayer) => (params.adjustments[prayer] = -1));

    const prayerTimes = new adhan.PrayerTimes(coordinates, new Date(), params);

    return res.json({
      metadata: {
        city: locationMeta.city,
        country: locationMeta.country_name,
        timeZone: locationMeta.timeZone,
        coordinates: {
          latitude: locationMeta.latitude,
          longitude: locationMeta.longitude,
        },
      },
      timings: formatPrayerTimings(prayerTimes, locationMeta.timeZone),
    });
  } catch (error) {
    console.error("[PrayerTimes]", error.message);
    return res.status(500).json({ error: "Internal Server Error." });
  }
}

module.exports = { getPrayerTimes };
