/**
 * Geocoding utilities for converting location text to coordinates
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName?: string;
}

/**
 * Fetches coordinates for a given location string using OpenStreetMap Nominatim API
 * @param location - Location string (e.g., "New York, USA" or "Karachi, Pakistan")
 * @returns Promise with lat/lng coordinates or null if not found
 */
export const geocodeLocation = async (location: string): Promise<GeocodeResult | null> => {
  if (!location || location.trim().length === 0) {
    return null;
  }

  try {
    const encodedLocation = encodeURIComponent(location.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

/**
 * Reverse geocodes coordinates to a location name
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with location display name or null if not found
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};
