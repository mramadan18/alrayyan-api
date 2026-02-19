const express = require("express");
const { getPrayerTimes } = require("../controllers/prayerTimesController");

const router = express.Router();

router.get("/prayer-times", getPrayerTimes);

module.exports = router;
