/**
 * Resolves precise coordinates (lat/lon) for a city+country using OpenStreetMap Nominatim.
 * More accurate than IP-based geolocation for prayer time calculations.
 * @param {string} city - City name (e.g., "Alexandria")
 * @param {string} country - Country name (e.g., "Egypt")
 * @returns {Promise<{latitude: number, longitude: number}|null>}
 */
async function getCoordinates(city, country) {
  const url = `https://nominatim.openstreetmap.org/search?state=${city.toLowerCase()}&country=${country.toLowerCase()}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
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

/**
 * Resolves city and country name for a given latitude and longitude using OpenStreetMap Nominatim.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<{city: string, country: string}|null>}
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AlRayyan-API/1.0 (prayer times service)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Nominatim API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data || !data.address) {
      throw new Error(`No location found for coordinates: ${lat}, ${lon}`);
    }

    // Nominatim returns city, town, village, or suburb depending on the location
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.suburb ||
      data.address.state ||
      "Unknown";
    const country = data.address.country || "Unknown";

    return { city, country };
  } catch (error) {
    console.error("Failed to reverse geocode from Nominatim:", error.message);
    return null;
  }
}

module.exports = { getCoordinates, reverseGeocode };
