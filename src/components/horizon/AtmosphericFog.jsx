import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../../store/useStore';
import { theme, lerpColor } from '../../config/theme';

export default function AtmosphericFog() {
  const { scene } = useThree();
  const isNight = useStore((s) => s.isNight);
  const weather = useStore((s) => s.weather);
  const timeOfDay = useStore((s) => s.timeOfDay);

  useEffect(() => {
    const fogColor = isNight ? theme.fogNightInt : theme.fogDayInt;
    let density = 0.008;

    if (weather.condition === 'fog') density = 0.025;
    else if (weather.condition === 'rain') density = 0.015;
    else if (weather.condition === 'clouds') density = 0.012;

    scene.fog = new THREE.FogExp2(fogColor, density);
    scene.background = new THREE.Color(fogColor);

    return () => {
      scene.fog = null;
    };
  }, [scene, isNight, weather.condition, timeOfDay]);

  return null;
}
