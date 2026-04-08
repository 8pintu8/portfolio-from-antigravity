import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import useStore from '../../store/useStore';

export default function PostEffects() {
  const qualityLevel = useStore((s) => s.qualityLevel);
  const isNight = useStore((s) => s.isNight);

  // We removed dynamic luminanceThresholds because changing them at runtime causes Bloom 
  // shaders to recompile, resulting in the "Sudden Flash Glitch".
  // Returning null on 'low' quality also rebuilds the renderer completely, causing a Freeze.
  // We keep the composer always active with static settings.

  return (
    <EffectComposer multisampling={4}>
      {qualityLevel !== 'low' && (
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.4}
          intensity={1.0}
          mipmapBlur
        />
      )}
      <Vignette
        offset={0.3}
        darkness={isNight ? 0.7 : 0.35}
        eskil={false}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
