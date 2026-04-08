/**
 * Geolocation utility.
 * Priority: Browser Geolocation → IP-based fallback → Bhopal, India.
 */

// Default: Bhopal, Madhya Pradesh, India
const FALLBACK = { lat: 23.2599, lon: 77.4126, city: 'Bhopal', country: 'India' };

export async function getUserLocation() {
  // Note: We intentionally skip navigator.geolocation here because asking for
  // location permissions aggressively on page load causes a browser Violation warning
  // and is poor UX for a portfolio. We rely entirely on silent IP-based resolution.

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
