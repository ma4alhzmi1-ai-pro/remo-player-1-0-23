import { readFileSync, existsSync } from "node:fs";
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

console.log("اكتمل فحص البنية الثابتة لنواة ريموكيبورد.");
