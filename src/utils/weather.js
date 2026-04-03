/**
 * Weather fetcher using Open-Meteo (completely free, zero API key).
 * Maps weather codes to simple conditions for the 3D scene.
 */

const WEATHER_CODE_MAP = {
  0: 'clear',        // Clear sky
  1: 'clear',        // Mainly clear
  2: 'clouds',       // Partly cloudy
  3: 'clouds',       // Overcast
  45: 'fog',         // Fog
  48: 'fog',         // Depositing rime fog
  51: 'drizzle',     // Light drizzle
  53: 'drizzle',     // Moderate drizzle
  55: 'drizzle',     // Dense drizzle
  61: 'rain',        // Slight rain
  63: 'rain',        // Moderate rain
  65: 'rain',        // Heavy rain
  71: 'snow',        // Slight snow
  73: 'snow',        // Moderate snow
  75: 'snow',        // Heavy snow
  77: 'snow',        // Snow grains
  80: 'rain',        // Rain showers slight
  81: 'rain',        // Rain showers moderate
  82: 'rain',        // Rain showers violent
  85: 'snow',        // Snow showers slight
  86: 'snow',        // Snow showers heavy
  95: 'thunderstorm',// Thunderstorm
  96: 'thunderstorm',// Thunderstorm hail
  99: 'thunderstorm',// Thunderstorm heavy hail
};

const DEFAULT_WEATHER = {
  condition: 'clear',
  temperature: 25,
  humidity: 50,
  windSpeed: 3,
  cloudCover: 0,
};

export async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,cloud_cover`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API ${res.status}`);
    const data = await res.json();
    const c = data.current;

    return {
      condition: WEATHER_CODE_MAP[c.weather_code] || 'clear',
      temperature: c.temperature_2m,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      cloudCover: c.cloud_cover,
    };
  } catch (err) {
    console.warn('Weather fetch failed, using defaults:', err.message);
    return DEFAULT_WEATHER;
  }
}

/**
 * Map weather condition to scene visual parameters.
 */
export function getWeatherSceneParams(weather) {
  const base = {
    fogDensity: 0.002,
    ambientIntensity: 0.5,
    turbidityBoost: 0,
    particleType: null,
    particleCount: 0,
    windStrength: weather.windSpeed / 20,
  };

  switch (weather.condition) {
    case 'clear':
      return { ...base, fogDensity: 0.001, ambientIntensity: 0.6 };
    case 'clouds':
      return { ...base, fogDensity: 0.003, ambientIntensity: 0.4, turbidityBoost: 3 };
    case 'fog':
      return { ...base, fogDensity: 0.015, ambientIntensity: 0.3, turbidityBoost: 5 };
    case 'drizzle':
      return { ...base, fogDensity: 0.005, ambientIntensity: 0.35, particleType: 'rain', particleCount: 500 };
    case 'rain':
      return { ...base, fogDensity: 0.008, ambientIntensity: 0.25, particleType: 'rain', particleCount: 2000, turbidityBoost: 4 };
    case 'snow':
      return { ...base, fogDensity: 0.006, ambientIntensity: 0.4, particleType: 'snow', particleCount: 1500, turbidityBoost: 2 };
    case 'thunderstorm':
      return { ...base, fogDensity: 0.01, ambientIntensity: 0.15, particleType: 'rain', particleCount: 3000, turbidityBoost: 6 };
    default:
      return base;
  }
}
