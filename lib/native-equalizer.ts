import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

export type EqualizerLaunchResult = "panel" | "sound-settings" | "unsupported";

/** Opens Android's real audio-effect panel when the device exposes one. */
export async function openNativeEqualizer(): Promise<EqualizerLaunchResult> {
  if (Platform.OS !== "android") return "unsupported";
  try {
    await IntentLauncher.startActivityAsync("android.media.action.DISPLAY_AUDIO_EFFECT_CONTROL_PANEL");
    return "panel";
  } catch {
    try {
      await IntentLauncher.startActivityAsync("android.settings.SOUND_SETTINGS");
      return "sound-settings";
    } catch {
      return "unsupported";
    }
  }
}
