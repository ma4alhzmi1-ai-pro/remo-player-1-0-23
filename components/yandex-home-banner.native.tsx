import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { AdTheme, BannerAdSize, BannerView } from "yandex-mobile-ads";

const HOME_BANNER_UNIT_ID = "RM-19800020-1";

export function YandexHomeBanner() {
  const [size, setSize] = useState<Awaited<ReturnType<typeof BannerAdSize.stickySize>> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setFailed(false);
    void BannerAdSize.stickySize(Dimensions.get("window").width - 32)
      .then((nextSize) => {
        if (isMounted) setSize(nextSize);
      })
      .catch(() => {
        if (isMounted) setFailed(true);
      });
    return () => { isMounted = false; };
  }, []);

  if (!size || failed) return null;

  return (
    <View style={styles.container} accessibilityLabel="إعلان">
      <BannerView
        size={size}
        adRequest={{ adUnitId: HOME_BANNER_UNIT_ID, adTheme: AdTheme.Dark }}
        onAdFailedToLoad={() => setFailed(true)}
        style={styles.banner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 18, marginBottom: 12, minHeight: 1 },
  banner: { alignSelf: "center" },
});
