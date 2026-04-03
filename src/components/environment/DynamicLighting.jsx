import { useMemo } from 'react';
import useStore from '../../store/useStore';
import { theme, lerpColor } from '../../config/theme';

export default function DynamicLighting() {
  const sunPosition = useStore((s) => s.sunPosition);
  const timeOfDay = useStore((s) => s.timeOfDay);
  const isNight = useStore((s) => s.isNight);
  const qualityLevel = useStore((s) => s.qualityLevel);

  const lightConfig = useMemo(() => {
    if (isNight) {
      return {
        directionalColor: theme.moonlightInt,
        directionalIntensity: 0.4,
        ambientColor: 0x1A1A3E,
        ambientIntensity: 0.2,
      };
    }

    const isGoldenHour = timeOfDay < 0.3 || timeOfDay > 0.7;
    if (isGoldenHour) {
      return {
        directionalColor: theme.sunGoldenInt,
        directionalIntensity: 1.5,
        ambientColor: lerpColor(0x1A1A3E, 0xFFE4C4, 0.4),
        ambientIntensity: 0.35,
      };
    }

    return {
      directionalColor: 0xFFF5E6,
      directionalIntensity: 2.0,
      ambientColor: 0xC4D4E8,
      ambientIntensity: 0.5,
    };
  }, [isNight, timeOfDay]);

  const shadowMapSize = qualityLevel === 'high' ? 2048 : qualityLevel === 'medium' ? 1024 : 512;

  return (
    <>
      <directionalLight
        position={sunPosition}
        color={lightConfig.directionalColor}
        intensity={lightConfig.directionalIntensity}
        castShadow={qualityLevel !== 'low'}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />

      <ambientLight
        color={lightConfig.ambientColor}
        intensity={lightConfig.ambientIntensity}
      />

      <hemisphereLight
        skyColor={isNight ? 0x0A1628 : 0x87CEEB}
        groundColor={theme.groundInt}
        intensity={isNight ? 0.08 : 0.3}
      />
    </>
  );
}
