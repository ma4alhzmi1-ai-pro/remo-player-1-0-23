import { AudioModule } from "expo-audio";
import { Platform } from "react-native";

export type NativeEqualizerSettings = {
  enabled: boolean;
  bands: number[];
  bass: number;
  virtualizer: number;
};

type NativeAndroidAudioControls = {
  getSystemMusicVolumeAsync?: () => Promise<number>;
  setSystemMusicVolumeAsync?: (volume: number) => Promise<number>;
  applyAudioEffectsAsync?: (enabled: boolean, bands: number[], bass: number, virtualizer: number) => Promise<boolean>;
};

const nativeControls = AudioModule as unknown as NativeAndroidAudioControls;
const clampUnit = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

/** يقرأ مستوى دفق وسائط Android، وليس مستوى صوت المشغل الداخلي فقط. */
export async function getSystemMusicVolume(): Promise<number | null> {
  if (Platform.OS !== "android" || !nativeControls.getSystemMusicVolumeAsync) return null;
  try {
    return clampUnit(await nativeControls.getSystemMusicVolumeAsync());
  } catch {
    return null;
  }
}

/** يغيّر مستوى دفق الوسائط الحقيقي في Android ضمن المجال الآمن 0–1. */
export async function setSystemMusicVolume(volume: number): Promise<number | null> {
  if (Platform.OS !== "android" || !nativeControls.setSystemMusicVolumeAsync) return null;
  try {
    return clampUnit(await nativeControls.setSystemMusicVolumeAsync(clampUnit(volume)));
  } catch {
    return null;
  }
}

/** يربط منحنى المعادل بالمشغل الصوتي الحالي في Android عند توفر AudioEffect. */
export async function applyNativeAudioEffects(settings: NativeEqualizerSettings): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.applyAudioEffectsAsync) return false;
  try {
    return await nativeControls.applyAudioEffectsAsync(
      settings.enabled,
      settings.bands.map((band) => Math.max(-12, Math.min(12, Number.isFinite(band) ? band : 0))),
      Math.max(0, Math.min(100, settings.bass)),
      Math.max(0, Math.min(100, settings.virtualizer)),
    );
  } catch {
    return false;
  }
}
