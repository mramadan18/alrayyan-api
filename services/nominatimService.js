const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Resolves precise coordinates (lat/lon) for a city+country using OpenStreetMap Nominatim.
 * More accurate than IP-based geolocation for prayer time calculations.
 * @param {string} city - City name (e.g., "Alexandria")
 * @param {string} country - Country name (e.g., "Egypt")
 * @returns {Promise<{latitude: number, longitude: number}|null>}
 */
async function getCoordinates(city, country) {
  const url = `${NOMINATIM_URL}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&format=json&limit=1`;

  console.log("url => ", url);

  try {
    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent header to identify the app
        "User-Agent": "AlRayyan-API/1.0 (prayer times service)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`No coordinates found for: ${city}, ${country}`);
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Failed to fetch coordinates from Nominatim:", error.message);
    return null;
  }
}

module.exports = { getCoordinates };
