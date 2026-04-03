import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import useStore from '../../store/useStore';

export default function PostEffects() {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const isNight = useStore((s) => s.isNight);

  // Disable all post-processing on low quality
  if (qualityLevel === 'low') return null;

  return (
    <EffectComposer multisampling={qualityLevel === 'high' ? 4 : 0}>
      <Bloom
        luminanceThreshold={isNight ? 0.2 : 0.6}
        luminanceSmoothing={0.4}
        intensity={isNight ? 1.2 : 0.4}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={isNight ? 0.7 : 0.35}
        eskil={false}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
