const adhan = require("adhan");
const moment = require("moment-timezone");
const { getUserLocation } = require("../services/geoService");
const calculationMethods = require("../config/calculationMethods");

// Fallback IP address for local testing
const FALLBACK_IP = process.env.DEV_FALLBACK_IP || "41.42.178.157";

/**
 * Parses method and madhab from query parameters and returns adhan params
 * @param {string} method - Calculation method (e.g., EGYPT, MWL)
 * @param {string} madhab  - Jurisprudential school (HANAFI or SHAFI)
 * @returns {adhan.CalculationParameters}
 */
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

/**
 * Format PrayerTimes object into formatted timings with timezone
 * @param {adhan.PrayerTimes} prayerTimes
 * @param {string} timeZone
 * @returns {Object}
 */
function formatPrayerTimings(prayerTimes, timeZone) {
  const fmt = (time) => moment(time).tz(timeZone).format("HH:mm");

  return {
    Fajr: fmt(prayerTimes.fajr),
    Sunrise: fmt(prayerTimes.sunrise),
    Dhuhr: fmt(prayerTimes.dhuhr),
    Asr: fmt(prayerTimes.asr),
    Maghrib: fmt(prayerTimes.maghrib),
    Isha: fmt(prayerTimes.isha),
  };
}

/**
 * GET /prayer-times
 * Accepts (optional): lat, lon, timezone, method, madhab
 * If coordinates are not provided, it fetches them via GeoIP
 */
async function getPrayerTimes(req, res) {
  try {
    const { lat, lon, timezone, method, madhab } = req.query;

    let locationMeta;

    // --- Option 1: Explicit coordinates from user ---
    if (lat && lon) {
      const timeZone = timezone || "UTC";
      locationMeta = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        timeZone,
        city: req.query.city || "Unknown",
        country_name: req.query.country || "Unknown",
      };
    } else {
      // --- Option 2: Get location from GeoIP ---
      let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

      // Fallback for local testing
      if (ip === "::1" || ip === "127.0.0.1") {
        ip = FALLBACK_IP;
      }

      const geoData = await getUserLocation(ip);

      if (!geoData || !geoData.latitude) {
        return res.status(503).json({
          error:
            "Could not determine geological location. Please provide lat and lon manually.",
        });
      }

      locationMeta = {
        latitude: parseFloat(geoData.latitude),
        longitude: parseFloat(geoData.longitude),
        timeZone: geoData.time_zone?.name || "UTC",
        city: geoData.city,
        country_name: geoData.country_name,
      };
    }

    // --- Calculate Prayer Times ---
    const coordinates = new adhan.Coordinates(
      locationMeta.latitude,
      locationMeta.longitude,
    );

    const params = buildCalculationParams(method, madhab);
    const date = new Date();
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

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
    console.error("Error calculating prayer times:", error.message);
    return res.status(500).json({ error: "Internal Server Error." });
  }
}

module.exports = { getPrayerTimes };
