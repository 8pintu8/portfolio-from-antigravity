/**
 * Geolocation utility.
 * Priority: Browser Geolocation → IP-based fallback → Bhopal, India.
 */

// Default: Bhopal, Madhya Pradesh, India
const FALLBACK = { lat: 23.2599, lon: 77.4126, city: 'Bhopal', country: 'India' };

export async function getUserLocation() {
  // Try browser geolocation first
  try {
    const pos = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('No geolocation'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        enableHighAccuracy: false,
      });
    });

    const { latitude: lat, longitude: lon } = pos.coords;

    // Try reverse geocode for city name
    try {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1`
      );
      // This endpoint doesn't support reverse geocoding well, 
      // so we'll use the IP fallback for city name
    } catch {}

    return { lat, lon, city: 'Your Location', country: '' };
  } catch (geoErr) {
    console.log('Browser geolocation denied/unavailable, trying IP...');
  }

  // Try IP-based geolocation
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city || data.capital || 'Unknown',
          country: data.country_name || '',
        };
      }
    }
  } catch (ipErr) {
    console.log('IP geolocation failed, using fallback.');
  }

  return FALLBACK;
}
