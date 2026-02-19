const GEO_API_KEY = process.env.GEO_API_KEY;
const GEO_API_URL = "https://api.ipgeolocation.io/ipgeo";

/**
 * Fetches user location data based on IP address
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<Object|null>} Location data or null on failure
 */
async function getUserLocation(ipAddress) {
  const url = `${GEO_API_URL}?apiKey=${GEO_API_KEY}&ip=${ipAddress}&fields=country_name,city,latitude,longitude,time_zone`;

  console.log(url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `GeoIP API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch location data:", error.message);
    return null;
  }
}

module.exports = { getUserLocation };
