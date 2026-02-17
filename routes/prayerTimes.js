const express = require("express");
const geoip = require("geoip-lite");
const adhan = require("adhan");
const moment = require("moment-timezone");

const router = express.Router();

// خريطة طرق الحساب المدعومة
const calculationMethods = {
  EGYPT: adhan.CalculationMethod.Egyptian(),
  UMM_AL_QURA: adhan.CalculationMethod.UmmAlQura(),
  MWL: adhan.CalculationMethod.MuslimWorldLeague(), // رابطة العالم الإسلامي
  KARACHI: adhan.CalculationMethod.Karachi(),
  NORTH_AMERICA: adhan.CalculationMethod.NorthAmerica(),
  DUBAI: adhan.CalculationMethod.Dubai(),
  KUWAIT: adhan.CalculationMethod.Kuwait(),
  QATAR: adhan.CalculationMethod.Qatar(),
  SINGAPORE: adhan.CalculationMethod.Singapore(),
  TURKEY: adhan.CalculationMethod.Turkey(),
};

router.get("/prayer-times", (req, res) => {
  // 1. Determine the IP (handles Localhost and Production)
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ip === "::1" || ip === "127.0.0.1") {
    ip = "156.213.212.105"; // IP تجريبي لمصر أثناء التطوير
  }

  // 2. Convert IP to geographical location (Local Lookup - No API calls)
  const geo = geoip.lookup(ip);
  if (!geo) {
    return res
      .status(404)
      .json({ error: "Could not determine location from IP" });
  }

  const [lat, lng] = geo.ll;
  const coordinates = new adhan.Coordinates(lat, lng);

  const userMethod = req.query.method || "EGYPT";
  const userMadhab = req.query.madhab || "SHAFI";

  // 3. Set calculation settings (e.g.: Egyptian General Survey Authority)
  const params =
    calculationMethods[userMethod.toUpperCase()] ||
    adhan.CalculationMethod.Egyptian();
  params.madhab =
    userMadhab.toUpperCase() === "HANAFI"
      ? adhan.Madhab.Hanafi
      : adhan.Madhab.Shafi;

  // 4. Calculate prayer times for the current date
  const date = new Date();
  const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

  // 5. Format time according to the user's timezone
  const timezone = geo.timezone || "Africa/Cairo";
  const formatTime = (time) => moment(time).tz(timezone).format("HH:mm");

  res.json({
    metadata: {
      city: geo.city,
      country: geo.country,
      timezone: timezone,
      coordinates: { lat, lng },
    },
    timings: {
      Fajr: formatTime(prayerTimes.fajr),
      Sunrise: formatTime(prayerTimes.sunrise),
      Dhuhr: formatTime(prayerTimes.dhuhr),
      Asr: formatTime(prayerTimes.asr),
      Maghrib: formatTime(prayerTimes.maghrib),
      Isha: formatTime(prayerTimes.isha),
    },
  });
});

module.exports = router;
