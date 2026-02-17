const express = require("express");
const cors = require("cors");
const prayerTimesRouter = require("./routes/prayerTimes");

const app = express();

app.use(cors());
app.use("/api/v1", prayerTimesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Al-Rayyan API live on port ${PORT}`));
