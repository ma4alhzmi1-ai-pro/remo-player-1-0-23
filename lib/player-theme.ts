import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const PLAYER_BG_KEY = 'remo-player.custom-player-bg.v1';
export const PLAYER_THEME_KEY = 'remo-player.player-theme-id.v1';

export type PlayerThemePreset = {
  id: string;
  name: string;
  nameEn: string;
  gradientColors: [string, string, string];
  accentColor: string;
  imageUri?: string;
};

export const PRESET_THEMES: PlayerThemePreset[] = [
  {
    id: 'anime-violet',
    name: 'أنمي بنفسجي (افتراضي)',
    nameEn: 'Anime Violet',
    gradientColors: ['#320B4E', '#1A062F', '#0D021A'],
    accentColor: '#E91E63',
    // High quality aesthetic anime fantasy background matching the user's screenshot
    imageUri: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80',
  },
  {
    id: 'cosmic-galaxy',
    name: 'فضاء كوني سديمي',
    nameEn: 'Cosmic Nebula',
    gradientColors: ['#120A2A', '#1E0E40', '#070214'],
    accentColor: '#A855F7',
    imageUri: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1080&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber-neon',
    name: 'سايبر نيون أزرق',
    nameEn: 'Cyber Neon',
    gradientColors: ['#0A192F', '#020C1B', '#000814'],
    accentColor: '#00F2FE',
    imageUri: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
  },
  {
    id: 'sunset-glow',
    name: 'غروب دافئ وردي',
    nameEn: 'Sunset Rose',
    gradientColors: ['#3A0CA3', '#7209B7', '#F72585'],
    accentColor: '#F72585',
    imageUri: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
  },
  {
    id: 'dark-obsidian',
    name: 'أسود كلاسيكي فاخر',
    nameEn: 'Dark Obsidian',
    gradientColors: ['#0B1119', '#131C26', '#1A2532'],
    accentColor: '#2EC5FF',
  },
];

export async function getStoredPlayerTheme(): Promise<{
  themeId: string;
  customImageUri: string | null;
}> {
  try {
    const [themeId, customImageUri] = await Promise.all([
      AsyncStorage.getItem(PLAYER_THEME_KEY),
      AsyncStorage.getItem(PLAYER_BG_KEY),
    ]);
    return {
      themeId: themeId || 'anime-violet',
      customImageUri: customImageUri || null,
    };
  } catch {
    return { themeId: 'anime-violet', customImageUri: null };
  }
}

export async function savePlayerThemeId(themeId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PLAYER_THEME_KEY, themeId);
  } catch {
    // Ignore
  }
}

export async function saveCustomPlayerBg(uri: string | null): Promise<void> {
  try {
    if (uri) {
      await AsyncStorage.setItem(PLAYER_BG_KEY, uri);
    } else {
      await AsyncStorage.removeItem(PLAYER_BG_KEY);
    }
  } catch {
    // Ignore
  }
}

/**
 * Prompts user to pick an image from device gallery to use as music player background
 */
export async function pickPlayerBackgroundImage(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'إذن الوصول مطلوب',
        'يرجى منح الإذن للوصول إلى معرض الصور لاختيار خلفية المشغل.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const uri = result.assets[0].uri;
    await saveCustomPlayerBg(uri);
    await savePlayerThemeId('custom');
    return uri;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'تعذر اختيار الصورة';
    Alert.alert('خطأ', message);
    return null;
  }
}
