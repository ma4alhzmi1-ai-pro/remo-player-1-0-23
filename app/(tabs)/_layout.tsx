import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-provider";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home-filled" color={color} />,
        }}
      />
      <Tabs.Screen
        name="music"
        options={{
          title: t("music"),
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="library-music" color={color} />,
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: t("video"),
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="movie" color={color} />,
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: t("playlists"),
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="queue-music" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t("search"),
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="search" color={color} />,
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
