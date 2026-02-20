const GEO_API_KEY = process.env.GEO_API_KEY;
const GEO_API_URL = "https://api.ipgeolocation.io/ipgeo";

/**
 * Fetches city, country, and timezone from ipgeolocation based on IP address.
 * Coordinates are intentionally excluded — resolved separately via Nominatim.
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<{city: string, country_name: string, time_zone: {name: string}}|null>}
 */
async function getUserLocation(ipAddress) {
  const url = `${GEO_API_URL}?apiKey=${GEO_API_KEY}&ip=${ipAddress}&fields=country_name,city,time_zone`;

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

/**
 * Fetches timezone information for a given latitude and longitude using ipgeolocation.io.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string|null>} - Returns the IANA timezone name (e.g., "Africa/Cairo")
 */
async function getTimezoneByCoords(lat, lon) {
  const url = `https://api.ipgeolocation.io/timezone?apiKey=${GEO_API_KEY}&lat=${lat}&long=${lon}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Timezone API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.timezone || null;
  } catch (error) {
    console.error("Failed to fetch timezone by coordinates:", error.message);
    return null;
  }
}

module.exports = { getUserLocation, getTimezoneByCoords };
