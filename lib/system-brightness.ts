import * as Brightness from "expo-brightness";
import { Platform } from "react-native";

export function clampBrightnessValue(value: number): number {
  if (!Number.isFinite(value)) return 0.6;
  return Math.max(0.05, Math.min(1, value));
}

export async function readCurrentSystemBrightness(): Promise<number> {
  if (Platform.OS === "web") return 1;
  try {
    const systemValue = await Brightness.getSystemBrightnessAsync();
    if (Number.isFinite(systemValue) && systemValue >= 0 && systemValue <= 1) {
      return clampBrightnessValue(systemValue);
    }
  } catch {
    // Fallback below
  }
  try {
    const windowValue = await Brightness.getBrightnessAsync();
    if (Number.isFinite(windowValue) && windowValue >= 0 && windowValue <= 1) {
      return clampBrightnessValue(windowValue);
    }
  } catch {
    // Ignore
  }
  return 0.6;
}

export async function hasSystemBrightnessPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const status = await Brightness.getPermissionsAsync();
    return Boolean(status?.granted);
  } catch {
    return false;
  }
}

export async function requestSystemBrightnessPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  try {
    const existing = await Brightness.getPermissionsAsync();
    if (existing?.granted) return true;
    const requested = await Brightness.requestPermissionsAsync();
    return Boolean(requested?.granted);
  } catch {
    return false;
  }
}

/**
 * يطبّق السطوع على مستوى نظام Android (SCREEN_BRIGHTNESS) عند توفر إذن WRITE_SETTINGS
 * ويزيل تجاوز النافذة المؤقت ليبقى شريط سطوع النظام متزامناً مع المشغل.
 * وإذا لم يُمنح الإذن بعد، يطبّق السطوع الفوري على الشاشة عبر نافذة المشغل.
 */
export async function applySystemOrScreenBrightness(
  value: number,
  allowSystemWrite: boolean,
): Promise<{ applied: number; linkedToSystem: boolean }> {
  const clamped = clampBrightnessValue(value);
  if (Platform.OS === "web") {
    return { applied: clamped, linkedToSystem: false };
  }
  if (Platform.OS === "android" && allowSystemWrite) {
    try {
      await Brightness.setSystemBrightnessAsync(clamped);
      await Brightness.restoreSystemBrightnessAsync().catch(() => undefined);
      return { applied: clamped, linkedToSystem: true };
    } catch {
      // Fall back to window brightness if permission was revoked mid-session
    }
  }
  try {
    await Brightness.setBrightnessAsync(clamped);
  } catch {
    // Ignore unsupported environments
  }
  return { applied: clamped, linkedToSystem: false };
}
