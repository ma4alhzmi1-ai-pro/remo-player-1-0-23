import AsyncStorage from "@react-native-async-storage/async-storage";

const INTRO_SKIP_KEY = "remo-player.skip-intro.v1";

export async function shouldSkipIntro() {
  return (await AsyncStorage.getItem(INTRO_SKIP_KEY)) === "true";
}

export async function skipIntroInFuture() {
  await AsyncStorage.setItem(INTRO_SKIP_KEY, "true");
}

export async function restoreIntro() {
  await AsyncStorage.removeItem(INTRO_SKIP_KEY);
}
