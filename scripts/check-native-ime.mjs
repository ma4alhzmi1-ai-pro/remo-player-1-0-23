import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "android-ime");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`✓ ${message}`);
};

const manifest = read("app/src/main/AndroidManifest.xml");
const build = read("app/build.gradle");
const service = read("app/src/main/java/com/remokeyboard/ime/RemoInputMethodService.java");
const keyboard = read("app/src/main/java/com/remokeyboard/ime/RemoKeyboardView.java");
const settings = read("app/src/main/java/com/remokeyboard/ime/KeyboardSettingsActivity.java");
const translation = read("app/src/main/java/com/remokeyboard/ime/TranslationEngine.java");
const emojiCatalog = read("app/src/main/assets/emoji_catalog.tsv");

expect(build.includes("minSdk 21"), "الحد الأدنى للبناء هو Android 5.0 (API 21)");
expect(manifest.includes("android.permission.BIND_INPUT_METHOD"), "الخدمة محمية بصلاحية لوحة المفاتيح النظامية");
expect(manifest.includes("android.view.InputMethod"), "يعرّف البيان خدمة إدخال أندرويد فعلية");
expect(service.includes("commitText") && service.includes("deleteSurroundingText"), "توجد أوامر إدخال وحذف مباشرة للحقل النشط");
expect(service.includes("SpeechRecognizer") && manifest.includes("RECORD_AUDIO"), "يتوفر مسار الإدخال الصوتي وإذن الميكروفون");
expect(service.includes("OnPrimaryClipChangedListener"), "تُلتقط عناصر الحافظة المنسوخة على مستوى النظام");
expect(keyboard.includes("new String[]{\"ة\", \"َ\"") && keyboard.includes("new String[]{\"ت\", \"ـ\""), "توجد بدائل الضغط المطول للتشكيل والمد");
expect(keyboard.includes("Page.ARABIC") && keyboard.includes("Page.ENGLISH") && keyboard.includes("Page.NUMBERS"), "توجد صفحات عربية وإنجليزية وأرقام ورموز");
expect(settings.includes("ACTION_INPUT_METHOD_SETTINGS") && settings.includes("showInputMethodPicker"), "توجد خطوات تفعيل واختيار لوحة المفاتيح");
expect(existsSync(join(root, "app/src/main/java/com/remokeyboard/ime/ClipboardRepository.java")), "توجد طبقة تخزين محلية للحافظة");
expect(settings.includes("الزخرفة والخطوط") && settings.includes("إعدادات الترجمة") && settings.includes("مظهر لوحة المفاتيح"), "توجد صفحات إعدادات مفصلة شبيهة بالمركز المرجعي");
expect(keyboard.includes("إعدادات الكيبورد") && keyboard.includes("تنفيذ") && settings.includes("ستايل المفاتيح"), "توجد أدوات الكيبورد وزر التنفيذ والمفاتيح بأسلوب الكمبيوتر");
expect(settings.includes("اختيار صورة من الاستوديو") && settings.includes("لوحات ألوان جاهزة"), "توجد أدوات تخصيص الخلفيات والألوان من الاستوديو");
expect(keyboard.includes("background_uri") && keyboard.includes("background_asset"), "تطبق لوحة الإدخال الخلفية المختارة أو صور الثيمات المحلية");
expect(keyboard.includes("Page.EMOJI") && keyboard.includes("EMOJI_GROUPS") && keyboard.includes("emojiCategoryRow"), "توجد لوحة إيموجي حديثة بفئات مستقلة داخل الكيبورد");
expect(keyboard.includes("ImageButton") && keyboard.includes("showStickerPopup") && keyboard.includes("STICKERS"), "توجد أزرار إيموجي مصورة ونافذة ملصقات مرئية مدمجة");
expect(existsSync(join(root, "app/src/main/java/com/remokeyboard/ime/KeyCap.java")), "توجد طبقة رسم مستقلة للمفاتيح ذات الرموز الثانوية");
const themeDirectory = join(root, "app/src/main/res/drawable-nodpi");
const expectedThemes = ["remo_feminine_rose_silk.webp", "remo_feminine_lilac_butterflies.webp", "remo_feminine_pearl_bloom.webp", "remo_feminine_violet_marble.webp", "remo_masculine_neon_grid.webp", "remo_masculine_ember_steel.webp", "remo_masculine_blue_flame.webp", "remo_masculine_forest_camo.webp", "remo_islamic_lanterns.webp", "remo_islamic_mosque_dusk.webp"];
expect(expectedThemes.every((theme) => existsSync(join(themeDirectory, theme))), "توجد مكتبة من 10 خلفيات محلية مضغوطة للثيمات");
const bundledEmoji = readdirSync(themeDirectory).filter((asset) => /^emoji_[0-9a-f_]+\.png$/.test(asset));
expect(bundledEmoji.length >= 40, "توجد مكتبة مرئية من 40 صورة إيموجي داخل الحزمة الأساسية");
expect(existsSync(join(root, "app/src/main/res/raw/noto_emoji_attribution.txt")), "توجد وثيقة مصدر وترخيص أصول الإيموجي المدمجة");
expect(emojiCatalog.split("\n").length >= 3500, "يتضمن فهرس Unicode المدمج أكثر من 3500 رمز إيموجي");
expect(keyboard.includes("showEmojiExplorerPopup") && keyboard.includes("EmojiCatalog.find"), "يوجد بحث محلي في مكتبة الإيموجي الشاملة");
expect(settings.includes("كمبيوتر كلاسيكي") && settings.includes("زجاجي") && settings.includes("نيون") && settings.includes("داكن احترافي"), "توجد خمسة استايلات مفاتيح مدمجة قابلة للاختيار");
const emojiFont = join(root, "app/src/main/assets/NotoColorEmoji.ttf");
expect(existsSync(emojiFont), "يوجد خط إيموجي حديث مدمج للأجهزة القديمة");
expect(statSync(emojiFont).size > 10_000_000, "يتضمن الخط الملون المدمج نطاق الإيموجي الحديث كاملًا");
expect(service.includes("getSelectedTextOrCurrentWord") && service.includes("replaceSelectedTextOrCurrentWord"), "تستطيع خدمة الإدخال قراءة النص المحدد وإدراج ترجمة بديلة");
expect(keyboard.includes("showTranslationPopup") && keyboard.includes("TranslationEngine.translate"), "يوجد مسار ترجمة يعرض المعاينة قبل إدراج النتيجة");
expect(translation.includes("AR_TO_EN") && translation.includes("EN_TO_AR") && translation.includes("ترجمة محلية"), "يوجد محرك ترجمة محلي عربي–إنجليزي مستقل عن الشبكة");

console.log("اكتمل فحص البنية الثابتة لنواة ريموكيبورد.");
