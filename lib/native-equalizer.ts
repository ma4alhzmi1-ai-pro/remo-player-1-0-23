import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

export type EqualizerLaunchResult = "panel" | "sound-settings" | "unsupported";
export type BluetoothLaunchResult = "settings" | "pairing" | "unsupported";

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

/** Opens Android Bluetooth settings so the user can connect/select a speaker or headset. */
export async function openBluetoothAudioSettings(): Promise<BluetoothLaunchResult> {
  if (Platform.OS !== "android") return "unsupported";
  try {
    await IntentLauncher.startActivityAsync("android.settings.BLUETOOTH_SETTINGS");
    return "settings";
  } catch {
    try {
      await IntentLauncher.startActivityAsync("android.settings.BLUETOOTH_PAIRING_SETTINGS");
      return "pairing";
    } catch {
      return "unsupported";
    }
  }
}
