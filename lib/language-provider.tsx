import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ar" | "en" | "fr" | "tr" | "es";
export type TranslationKey = keyof typeof translations.ar;

export const APP_LANGUAGE_OPTIONS: Array<{ id: AppLanguage; label: string; nativeLabel: string }> = [
  { id: "ar", label: "العربية", nativeLabel: "العربية" },
  { id: "en", label: "الإنجليزية", nativeLabel: "English" },
  { id: "fr", label: "الفرنسية", nativeLabel: "Français" },
  { id: "tr", label: "التركية", nativeLabel: "Türkçe" },
  { id: "es", label: "الإسبانية", nativeLabel: "Español" },
];

const translations = {
  ar: { home: "الرئيسية", music: "الموسيقى", video: "الفيديو", playlists: "القوائم", search: "بحث", settings: "الإعدادات", settingsSubtitle: "إدارة مكتبتك وتفضيلات REMO PLAYER", language: "لغة التطبيق", languageDescription: "اختر لغة الواجهة التي تناسبك، وسيحفظ REMO PLAYER اختيارك على جهازك.", colorTheme: "ثيمة الألوان", colorThemeDescription: "اختر اللمسة التي تناسب ذوقك، وسيحفظها REMO PLAYER على جهازك.", rescan: "إعادة فهرسة المكتبة", rescanDescription: "البحث عن الموسيقى والفيديوهات في جهازك", importFiles: "استيراد ملفات", importFilesDescription: "اختيار وسائط محددة من التخزين", backup: "نسخ قوائم التشغيل احتياطياً", backupDescription: "تصدير ملف JSON محلي عبر المشاركة", restore: "استعادة قوائم التشغيل", restoreDescription: "استيراد نسخة REMO PLAYER احتياطية", formats: "صيغ الوسائط والترجمة", formatsDescription: "استيراد SRT وVTT وASS وSSA وصيغ أخرى", about: "عن REMO PLAYER", aboutDescription: "مشغل وسائط محلي خاص بملفاتك" },
  en: { home: "Home", music: "Music", video: "Video", playlists: "Playlists", search: "Search", settings: "Settings", settingsSubtitle: "Manage your library and REMO PLAYER preferences", language: "App language", languageDescription: "Choose your interface language. REMO PLAYER saves your choice on this device.", colorTheme: "Color theme", colorThemeDescription: "Choose the accent that suits you. REMO PLAYER saves it on this device.", rescan: "Rescan library", rescanDescription: "Find music and videos on your device", importFiles: "Import files", importFilesDescription: "Choose media from storage", backup: "Back up playlists", backupDescription: "Export a local JSON file through sharing", restore: "Restore playlists", restoreDescription: "Import a REMO PLAYER backup", formats: "Media and subtitle formats", formatsDescription: "Import SRT, VTT, ASS, SSA and more", about: "About REMO PLAYER", aboutDescription: "A private local media player for your files" },
  fr: { home: "Accueil", music: "Musique", video: "Vidéo", playlists: "Listes", search: "Rechercher", settings: "Paramètres", settingsSubtitle: "Gérez votre bibliothèque et les préférences REMO PLAYER", language: "Langue de l’application", languageDescription: "Choisissez la langue de l’interface. REMO PLAYER enregistre votre choix sur cet appareil.", colorTheme: "Thème de couleurs", colorThemeDescription: "Choisissez votre accent favori. REMO PLAYER le conserve sur cet appareil.", rescan: "Analyser la bibliothèque", rescanDescription: "Rechercher la musique et les vidéos sur l’appareil", importFiles: "Importer des fichiers", importFilesDescription: "Choisir des médias depuis le stockage", backup: "Sauvegarder les listes", backupDescription: "Exporter un fichier JSON local", restore: "Restaurer les listes", restoreDescription: "Importer une sauvegarde REMO PLAYER", formats: "Formats média et sous-titres", formatsDescription: "Importer SRT, VTT, ASS, SSA et plus", about: "À propos de REMO PLAYER", aboutDescription: "Lecteur multimédia local et privé pour vos fichiers" },
  tr: { home: "Ana Sayfa", music: "Müzik", video: "Video", playlists: "Listeler", search: "Ara", settings: "Ayarlar", settingsSubtitle: "Kitaplığınızı ve REMO PLAYER tercihlerini yönetin", language: "Uygulama dili", languageDescription: "Arayüz dilinizi seçin. REMO PLAYER seçiminizi bu cihazda saklar.", colorTheme: "Renk teması", colorThemeDescription: "Size uygun vurguyu seçin. REMO PLAYER bunu bu cihazda saklar.", rescan: "Kitaplığı yeniden tara", rescanDescription: "Cihazınızdaki müzik ve videoları bul", importFiles: "Dosya içe aktar", importFilesDescription: "Depolamadan medya seç", backup: "Listeleri yedekle", backupDescription: "Yerel JSON dosyasını paylaşarak dışa aktar", restore: "Listeleri geri yükle", restoreDescription: "REMO PLAYER yedeğini içe aktar", formats: "Medya ve altyazı biçimleri", formatsDescription: "SRT, VTT, ASS, SSA ve daha fazlasını içe aktar", about: "REMO PLAYER hakkında", aboutDescription: "Dosyalarınız için özel yerel medya oynatıcı" },
  es: { home: "Inicio", music: "Música", video: "Vídeo", playlists: "Listas", search: "Buscar", settings: "Ajustes", settingsSubtitle: "Administra tu biblioteca y las preferencias de REMO PLAYER", language: "Idioma de la aplicación", languageDescription: "Elige el idioma de la interfaz. REMO PLAYER guarda tu elección en este dispositivo.", colorTheme: "Tema de colores", colorThemeDescription: "Elige el acento que prefieras. REMO PLAYER lo guarda en este dispositivo.", rescan: "Volver a escanear", rescanDescription: "Buscar música y vídeos en tu dispositivo", importFiles: "Importar archivos", importFilesDescription: "Elegir medios del almacenamiento", backup: "Respaldar listas", backupDescription: "Exportar un archivo JSON local", restore: "Restaurar listas", restoreDescription: "Importar una copia de REMO PLAYER", formats: "Formatos multimedia y subtítulos", formatsDescription: "Importar SRT, VTT, ASS, SSA y más", about: "Acerca de REMO PLAYER", aboutDescription: "Reproductor multimedia local y privado para tus archivos" },
} as const;

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (key: TranslationKey) => string; isRTL: boolean };
const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANGUAGE_STORAGE_KEY = "remo-player.language.v1";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("ar");
  useEffect(() => { void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => { if (APP_LANGUAGE_OPTIONS.some((option) => option.id === stored)) setLanguageState(stored as AppLanguage); }); }, []);
  useEffect(() => { if (typeof document !== "undefined") { document.documentElement.lang = language; document.documentElement.dir = language === "ar" ? "rtl" : "ltr"; } }, [language]);
  const setLanguage = useCallback((next: AppLanguage) => { setLanguageState(next); void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next); }, []);
  const value = useMemo(() => ({ language, setLanguage, t: (key: TranslationKey) => translations[language][key], isRTL: language === "ar" }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
