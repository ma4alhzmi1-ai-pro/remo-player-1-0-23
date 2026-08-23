import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * يطلب إذن الإشعارات فقط عند بدء تشغيل وسائط، حتى تظهر عناصر التحكم في Android 13+.
 * عدم منح الإذن لا يمنع تشغيل الملف؛ بل يخفي عناصر التحكم من درج الإشعارات.
 */
export async function prepareMediaNotificationControls() {
  if (Platform.OS !== "android") return true;

  try {
    await Notifications.setNotificationChannelAsync("remo-media", {
      name: "REMO PLAYER — تشغيل الوسائط",
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [],
      sound: null,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.warn("تعذر تهيئة عناصر تحكم الوسائط", error);
    return false;
  }
}
