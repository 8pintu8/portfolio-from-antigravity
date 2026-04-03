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
