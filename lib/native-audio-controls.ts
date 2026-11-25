import { AudioModule } from "expo-audio";
import { Platform } from "react-native";

export type NativeEqualizerSettings = {
  enabled: boolean;
  bands: number[];
  bass: number;
  virtualizer: number;
  room?: "none" | "small" | "medium" | "large";
};

type NativeAndroidAudioControls = {
  getSystemMusicVolumeAsync?: () => Promise<number>;
  setSystemMusicVolumeAsync?: (volume: number, showUi?: boolean) => Promise<number>;
  setVolumeBoostAsync?: (boostPercent: number, sessionId?: number) => Promise<boolean>;
  getVolumeBoostAsync?: () => Promise<number>;
  setAbsoluteAudioBoostAsync?: (enabled: boolean, gainPercent: number, clarityBoost: boolean) => Promise<boolean>;
  applyAudioEffectsAsync?: (
    enabled: boolean,
    bands: number[],
    bass: number,
    virtualizer: number,
    room?: string,
  ) => Promise<boolean>;
  extractAudioTrackNativeAsync?: (inputUri: string, outputPath: string) => Promise<boolean>;
  remuxToMp4NativeAsync?: (inputUri: string, outputPath: string) => Promise<boolean>;
};

const nativeControls = AudioModule as unknown as NativeAndroidAudioControls;

const clampVolume = (value: number) => Math.max(0, Math.min(2.0, Number.isFinite(value) ? value : 0));

/** يقرأ مستوى دفق وسائط Android أو المستوى المعزز حتى 200%. */
export async function getSystemMusicVolume(): Promise<number | null> {
  if (Platform.OS !== "android" || !nativeControls.getSystemMusicVolumeAsync) return null;
  try {
    return clampVolume(await nativeControls.getSystemMusicVolumeAsync());
  } catch {
    return null;
  }
}

/** يغيّر مستوى دفق الوسائط الحقيقي في Android ويرفع التعزيز البرمجي فوق 100% عبر LoudnessEnhancer. */
export async function setSystemMusicVolume(volume: number, showSystemUi = false): Promise<number | null> {
  if (Platform.OS !== "android" || !nativeControls.setSystemMusicVolumeAsync) return null;
  try {
    return clampVolume(await nativeControls.setSystemMusicVolumeAsync(clampVolume(volume), Boolean(showSystemUi)));
  } catch {
    return null;
  }
}

/** يطبّق نسبة تعزيز الصوت (0 إلى 1 تعادل 0% إلى +100% فوق الحد الأقصى) عبر معالج LoudnessEnhancer */
export async function setVolumeBoost(boostPercent: number, sessionId?: number): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.setVolumeBoostAsync) return false;
  try {
    return await nativeControls.setVolumeBoostAsync(Math.max(0, Math.min(1.0, boostPercent)), sessionId);
  } catch {
    return false;
  }
}

/** يقرأ نسبة تعزيز الصوت النشطة حالياً. */
export async function getVolumeBoost(): Promise<number> {
  if (Platform.OS !== "android" || !nativeControls.getVolumeBoostAsync) return 0;
  try {
    const val = await nativeControls.getVolumeBoostAsync();
    return Math.max(0, Math.min(1.0, Number.isFinite(val) ? val : 0));
  } catch {
    return 0;
  }
}

/** يربط منحنى المعادل والتردد بالمشغل الصوتي الحالي في Android عند توفر AudioEffect. */
export async function applyNativeAudioEffects(settings: NativeEqualizerSettings): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.applyAudioEffectsAsync) return false;
  try {
    return await nativeControls.applyAudioEffectsAsync(
      settings.enabled,
      settings.bands.map((band) => Math.max(-12, Math.min(12, Number.isFinite(band) ? band : 0))),
      Math.max(0, Math.min(100, settings.bass)),
      Math.max(0, Math.min(100, settings.virtualizer)),
      settings.room ?? "none",
    );
  } catch {
    return false;
  }
}

/** استخراج المسار الصوتي الأصلي إلى M4A على Android عبر MediaExtractor + MediaMuxer. */
export async function extractAudioTrackNative(inputUri: string, outputPath: string): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.extractAudioTrackNativeAsync) return false;
  try {
    return await nativeControls.extractAudioTrackNativeAsync(inputUri, outputPath);
  } catch {
    return false;
  }
}

/** إعادة تغليف مسارات الفيديو والصوت المتوافقة إلى حاوية MP4 حقيقية على Android. */
export async function remuxToMp4Native(inputUri: string, outputPath: string): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.remuxToMp4NativeAsync) return false;
  try {
    return await nativeControls.remuxToMp4NativeAsync(inputUri, outputPath);
  } catch {
    return false;
  }
}

export type AbsoluteAudioBoostSettings = {
  enabled: boolean;
  gainLevel: number; // 0 to 100
  clarityBoost: boolean;
};

export async function applyAbsoluteAudioBoost(settings: AbsoluteAudioBoostSettings): Promise<boolean> {
  if (Platform.OS !== "android" || !nativeControls.setAbsoluteAudioBoostAsync) return false;
  try {
    return await nativeControls.setAbsoluteAudioBoostAsync(
      settings.enabled,
      Math.max(0, Math.min(100, settings.gainLevel)),
      settings.clarityBoost,
    );
  } catch {
    return false;
  }
}
