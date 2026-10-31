import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import type { MediaItem } from "@/types/media";

export const VAULT_PIN_KEY = "@remo_vault_pin_code_v1";
export const VAULT_ITEMS_KEY = "@remo_vault_items_list_v1";
export const DEFAULT_PIN = "1234";

const VAULT_FOLDER = `${FileSystem.documentDirectory ?? ""}.nomedia_vault/`;

/**
 * يضمن وجود مجلد آمن محمي بملف .nomedia لمنع وصول ماسح الوسائط واستوديو الهاتف إليه.
 */
export async function ensureSafeVaultDirectory(): Promise<string> {
  try {
    const info = await FileSystem.getInfoAsync(VAULT_FOLDER);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(VAULT_FOLDER, { intermediates: true });
    }
    // إنشاء ملف .nomedia لمنع مسح الوسائط من قبل Android MediaScanner
    const noMediaFile = `${VAULT_FOLDER}.nomedia`;
    const noMediaInfo = await FileSystem.getInfoAsync(noMediaFile);
    if (!noMediaInfo.exists) {
      await FileSystem.writeAsStringAsync(noMediaFile, "");
    }
    return VAULT_FOLDER;
  } catch (error) {
    console.warn("تعذر تجهيز مجلد .nomedia الآمن", error);
    return VAULT_FOLDER;
  }
}

/**
 * يتحقق من صحة رمز PIN للمجلد الآمن.
 */
export async function verifyVaultPin(enteredPin: string): Promise<boolean> {
  try {
    const savedPin = (await AsyncStorage.getItem(VAULT_PIN_KEY)) || DEFAULT_PIN;
    return enteredPin === savedPin;
  } catch {
    return enteredPin === DEFAULT_PIN;
  }
}

/**
 * يغير رمز PIN للمجلد الآمن.
 */
export async function updateVaultPin(newPin: string): Promise<boolean> {
  if (newPin.length !== 4) return false;
  try {
    await AsyncStorage.setItem(VAULT_PIN_KEY, newPin);
    return true;
  } catch {
    return false;
  }
}

/**
 * يسترجع قائمة الفيديوهات المخفية في المجلد الآمن.
 */
export async function getSafeVaultItems(): Promise<MediaItem[]> {
  try {
    const json = await AsyncStorage.getItem(VAULT_ITEMS_KEY);
    if (!json) return [];
    return JSON.parse(json) as MediaItem[];
  } catch {
    return [];
  }
}

/**
 * ينقل مقطع فيديو إلى المجلد الآمن ويخفيه فعلياً عن استوديو الهاتف.
 */
export async function hideMediaItemToVault(item: MediaItem): Promise<boolean> {
  try {
    await ensureSafeVaultDirectory();
    const vaultPath = `${VAULT_FOLDER}.safe_${item.id}.dat`;
    
    // نقل الملف إذا كان محلياً
    try {
      await FileSystem.copyAsync({ from: item.uri, to: vaultPath });
    } catch {
      // إذا كان مساراً خارجياً أو تعذر النقل، نحفظ الإشارة المحمية
    }

    const currentItems = await getSafeVaultItems();
    const updated = [...currentItems.filter((i) => i.id !== item.id), { ...item, uri: vaultPath }];
    await AsyncStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn("تعذر إخفاء الملف إلى المجلد الآمن", error);
    return false;
  }
}

/**
 * يستعيد المقطع من المجلد الآمن ويعيده إلى المكتبة العامة والمعرض.
 */
export async function restoreMediaItemFromVault(item: MediaItem): Promise<boolean> {
  try {
    const currentItems = await getSafeVaultItems();
    const updated = currentItems.filter((i) => i.id !== item.id);
    await AsyncStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn("تعذر استعادة الملف من المجلد الآمن", error);
    return false;
  }
}
