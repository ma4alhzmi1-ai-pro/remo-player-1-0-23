import { useEffect } from "react";

import { MobileAds } from "yandex-mobile-ads";

/** Initializes the native Yandex SDK after the React application has mounted. */
export function YandexAdsInitializer() {
  useEffect(() => {
    let active = true;
    void MobileAds.initialize().catch(() => {
      // A future ad request can retry initialization; startup must remain available.
      if (!active) return;
    });
    return () => { active = false; };
  }, []);

  return null;
}
