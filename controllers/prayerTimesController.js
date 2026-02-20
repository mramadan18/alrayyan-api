const adhan = require("adhan");
const moment = require("moment-timezone");
const {
  getUserLocation,
  getTimezoneByCoords,
} = require("../services/geoService");
const {
  getCoordinates,
  reverseGeocode,
} = require("../services/nominatimService");
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
  const { lat, lon, city, country } = req.query;
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "127.0.0.1") ip = FALLBACK_IP;

  /**
   * Enriches location metadata with a timezone if missing and caches it.
   */
  const enrichAndCache = async (baseMeta, clientIp) => {
    if (!baseMeta.timeZone) {
      baseMeta.timeZone =
        (await getTimezoneByCoords(baseMeta.latitude, baseMeta.longitude)) ||
        "UTC";
    }
    await cacheLocation(clientIp, baseMeta);
    return baseMeta;
  };

  // Pre-fetch IP cache to avoid redundant external calls if user sends same params
  const byIp = ip ? await getCachedByIp(ip) : null;

  // Case 1: Precise coordinates provided by user
  if (lat && lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // If we already have this IP cached and the coordinates are the same (or very close), use cache
    if (
      byIp &&
      Math.abs(byIp.latitude - latitude) < 0.0001 &&
      Math.abs(byIp.longitude - longitude) < 0.0001
    ) {
      return byIp;
    }

    const geoNames = await reverseGeocode(latitude, longitude);

    if (geoNames) {
      const cached = await getCachedByCity(geoNames.city);
      if (cached) {
        // Use exact user coordinates but cached metadata for other fields
        const meta = { ...cached, latitude, longitude };
        if (ip) await cacheLocation(ip, meta);
        return meta;
      }

      return await enrichAndCache(
        {
          latitude,
          longitude,
          city: geoNames.city,
          country_name: geoNames.country,
        },
        ip,
      );
    }
  }

  // Case 2: City name provided by user
  if (city) {
    // If IP cache matches the requested city, return it
    if (byIp && byIp.city.toLowerCase() === city.trim().toLowerCase()) {
      return byIp;
    }

    const cached = await getCachedByCity(city);
    if (cached) {
      if (ip) await cacheLocation(ip, cached);
      return cached;
    }

    const coords = await getCoordinates(city, country || "");
    if (coords) {
      return await enrichAndCache(
        {
          ...coords,
          city,
          country_name: country || "Unknown",
        },
        ip,
      );
    }
  }

  // Case 3: Fallback to IP address
  if (byIp) return byIp;

  const geoData = await getUserLocation(ip);
  if (geoData?.city) {
    const cached = await getCachedByCity(geoData.city);
    if (cached) {
      await cacheLocation(ip, cached);
      return cached;
    }

    const coords = await getCoordinates(geoData.city, geoData.country_name);
    if (coords) {
      return await enrichAndCache(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: geoData.city,
          country_name: geoData.country_name,
          timeZone: geoData.time_zone?.name,
        },
        ip,
      );
    }
  }

  return null;
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

    // const adjustments = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    // adjustments.forEach((prayer) => (params.adjustments[prayer] = -1));

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
