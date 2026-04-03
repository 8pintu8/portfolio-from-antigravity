import SunCalc from 'suncalc';

/**
 * Convert sun altitude + azimuth into a Three.js world-space position vector.
 * Returns [x, y, z] suitable for Sky sunPosition and directional light.
 */
export function getSunPositionVector(date, lat, lon) {
  const pos = SunCalc.getPosition(date, lat, lon);
  const altitude = pos.altitude; // radians, negative = below horizon
  const azimuth = pos.azimuth;   // radians, 0 = south

  // Convert spherical to cartesian on a large sphere (radius 100)
  const r = 100;
  const x = r * Math.cos(altitude) * Math.sin(azimuth);
  const y = r * Math.sin(altitude);
  const z = r * Math.cos(altitude) * Math.cos(azimuth);

  return [x, y, z];
}

/**
 * Get time-of-day factor: 0 = midnight, 0.5 = noon, 1 = midnight.
 */
export function getTimeOfDayFactor(date, lat, lon) {
  const times = SunCalc.getTimes(date, lat, lon);
  const sunrise = times.sunrise.getTime();
  const sunset = times.sunset.getTime();
  const now = date.getTime();
  const solarNoon = times.solarNoon.getTime();

  if (now >= sunrise && now <= sunset) {
    // Daytime: map sunrise→noon = 0.25→0.5, noon→sunset = 0.5→0.75
    if (now <= solarNoon) {
      return 0.25 + 0.25 * ((now - sunrise) / (solarNoon - sunrise));
    } else {
      return 0.5 + 0.25 * ((now - solarNoon) / (sunset - solarNoon));
    }
  } else {
    // Nighttime
    if (now > sunset) {
      const midnight = new Date(date);
      midnight.setHours(24, 0, 0, 0);
      const total = midnight.getTime() - sunset;
      return 0.75 + 0.25 * ((now - sunset) / total);
    } else {
      const midnight = new Date(date);
      midnight.setHours(0, 0, 0, 0);
      const total = sunrise - midnight.getTime();
      return 0.25 * ((now - midnight.getTime()) / total);
    }
  }
}

/**
 * Get sky shader parameters based on sun altitude.
 */
export function getSkyParameters(date, lat, lon) {
  const pos = SunCalc.getPosition(date, lat, lon);
  const alt = pos.altitude; // radians
  const altDeg = alt * (180 / Math.PI);

  // Below horizon (night)
  if (altDeg < -6) {
    return {
      turbidity: 1,
      rayleigh: 0.1,
      mieCoefficient: 0.001,
      mieDirectionalG: 0.8,
      isNight: true,
      sunAltitude: altDeg,
    };
  }

  // Twilight / golden hour (-6 to 10 degrees)
  if (altDeg < 10) {
    const t = (altDeg + 6) / 16; // 0 to 1
    return {
      turbidity: 2 + t * 4,
      rayleigh: 0.5 + t * 2.5,
      mieCoefficient: 0.005 + t * 0.02,
      mieDirectionalG: 0.7 + t * 0.2,
      isNight: false,
      sunAltitude: altDeg,
    };
  }

  // Full day (10+ degrees)
  return {
    turbidity: 6 + Math.min(altDeg / 10, 4),
    rayleigh: 3,
    mieCoefficient: 0.025,
    mieDirectionalG: 0.9,
    isNight: false,
    sunAltitude: altDeg,
  };
}
