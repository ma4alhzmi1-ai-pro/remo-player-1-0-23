import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/components/remo-ui";
import { ScreenContainer } from "@/components/screen-container";

export default function SupportDeveloperScreen() {
  const router = useRouter();
  const [thankVisible, setThankVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const thankAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.spring(thankAnimation, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 180 }),
      Animated.delay(2400),
      Animated.timing(thankAnimation, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]);
    sequence.start(({ finished }) => { if (finished) setThankVisible(false); });
    return () => sequence.stop();
  }, [thankAnimation]);

  const copyTransferNumber = async () => {
    try {
      await Clipboard.setStringAsync("752490");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return <ScreenContainer className="px-0"><View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.dimmed]}><MaterialIcons name="arrow-forward" size={22} color={colors.text} /></Pressable><View><Text style={styles.title}>ادعم المطور</Text><Text style={styles.subtitle}>محمد الحزمي · محفظة جيب</Text></View></View><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.hero}><View style={styles.heart}><MaterialIcons name="favorite" size={29} color="#FF7A79" /></View><Text style={styles.heroTitle}>شكراً لدعمك</Text><Text style={styles.heroBody}>دعمك اختياري ويساعد في تطوير REMO PLAYER. اختر الطريقة الأنسب لك لإتمام العملية خارج التطبيق.</Text></View><View style={styles.qrCard}><Image source={require("@/assets/images/jeeb-support-qr.jpg")} style={styles.qr} resizeMode="contain" /><View style={styles.walletPill}><MaterialIcons name="account-balance-wallet" size={18} color={colors.cyan} /><Text style={styles.walletText}>محفظة جيب</Text></View></View><View style={styles.instructions}><View style={styles.instructionsHead}><MaterialIcons name="format-list-numbered-rtl" size={21} color={colors.cyan} /><Text style={styles.instructionsTitle}>كيفية تقديم الدعم</Text></View><Step number="1" text="بعد تسجيل الدخول إلى حسابك في جيب، امسح رمز المحفظة لدعم المطور محمد الحزمي بأي مبلغ تختاره." /><Step number="2" text="أو افتح «تحويلات مالية»، ثم اختر «تحويل إلى مشترك»، وأدخل الرقم التالي في خانة رقم الموبايل." /><Pressable onPress={() => void copyTransferNumber()} style={({ pressed }) => [styles.transferBox, pressed && styles.dimmed]} accessibilityLabel="نسخ رقم التحويل 752490"><Text style={styles.transferLabel}>رقم التحويل</Text><View style={styles.transferRow}><MaterialIcons name={copied ? "check" : "content-copy"} size={18} color={copied ? "#44D7A8" : colors.cyan} /><Text style={styles.transferNumber}>752490</Text></View><Text style={[styles.copyHint, copied && styles.copyHintSuccess]}>{copied ? "تم النسخ إلى الحافظة" : "اضغط لنسخ الرقم"}</Text></Pressable><Step number="3" text="أدخل المبلغ ثم اضغط «استمرار»، وتأكد قبل الإتمام أن اسم المستلم الظاهر هو:" /><View style={styles.recipientBox}><MaterialIcons name="verified-user" size={21} color="#44D7A8" /><Text style={styles.recipientName}>محمد عبده علي حسن الحزمي</Text></View></View><View style={styles.notice}><MaterialIcons name="lock-outline" size={19} color={colors.cyan} /><Text style={styles.noticeText}>لا يجمع REMO PLAYER بيانات الدفع ولا يعالج أي تحويلات مالية. راجع المبلغ واسم المستلم داخل محفظة جيب قبل التأكيد.</Text></View></ScrollView>{thankVisible ? <Animated.View pointerEvents="none" style={[styles.thankOverlay, { opacity: thankAnimation, transform: [{ translateY: thankAnimation.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }, { scale: thankAnimation.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]}><View style={styles.thankCard}><View style={styles.thankIcon}><MaterialIcons name="volunteer-activism" size={27} color="#FF8B8B" /></View><Text style={styles.thankTitle}>شكراً لوجودك</Text><Text style={styles.thankText}>دعمك وثقتك تحفّزان تطوير REMO PLAYER.</Text></View></Animated.View> : null}</ScreenContainer>;
}

function Step({ number, text }: { number: string; text: string }) {
  return <View style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View><Text style={styles.stepText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  header: { height: 82, paddingHorizontal: 18, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }, back: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, title: { color: colors.text, fontSize: 24, fontWeight: "900", textAlign: "right" }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 2, textAlign: "right" }, content: { padding: 16, paddingBottom: 44, gap: 14 }, hero: { padding: 22, borderRadius: 24, backgroundColor: "#102A42", borderWidth: 1, borderColor: "#236589", alignItems: "flex-end" }, heart: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#382333", alignItems: "center", justifyContent: "center" }, heroTitle: { color: colors.text, marginTop: 12, fontSize: 21, fontWeight: "900", textAlign: "right" }, heroBody: { color: "#C5D6E8", marginTop: 8, fontSize: 13, lineHeight: 21, textAlign: "right" }, qrCard: { padding: 19, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, elevation: 5 }, qr: { width: 260, height: 260, borderRadius: 12 }, walletPill: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "#10263B", flexDirection: "row-reverse", alignItems: "center", gap: 7 }, walletText: { color: colors.text, fontSize: 12, fontWeight: "900" }, instructions: { padding: 18, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 14 }, instructionsHead: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "flex-start", gap: 8 }, instructionsTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, step: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }, stepNumber: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#123B55", alignItems: "center", justifyContent: "center" }, stepNumberText: { color: colors.cyan, fontSize: 12, fontWeight: "900" }, stepText: { flex: 1, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "right" }, transferBox: { padding: 14, borderRadius: 16, backgroundColor: "#102A42", alignItems: "center" }, transferLabel: { color: colors.muted, fontSize: 11, fontWeight: "800" }, transferRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 3 }, transferNumber: { color: colors.text, fontSize: 27, fontWeight: "900", letterSpacing: 2 }, copyHint: { color: colors.cyan, fontSize: 10, fontWeight: "800", marginTop: 4 }, copyHintSuccess: { color: "#44D7A8" }, recipientBox: { padding: 13, borderRadius: 16, backgroundColor: "#133530", flexDirection: "row-reverse", alignItems: "center", gap: 8 }, recipientName: { flex: 1, color: "#D6FFF1", fontSize: 13, fontWeight: "900", textAlign: "right" }, notice: { padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }, noticeText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "right" }, thankOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(3, 10, 18, 0.76)", alignItems: "center", justifyContent: "center", padding: 28 }, thankCard: { width: "100%", maxWidth: 340, padding: 25, borderRadius: 28, backgroundColor: "#102A42", borderWidth: 1, borderColor: "#2B85B4", alignItems: "center" }, thankIcon: { width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#3B2635" }, thankTitle: { color: colors.text, fontSize: 23, fontWeight: "900", marginTop: 14 }, thankText: { color: "#C5D6E8", fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 7 }, dimmed: { opacity: 0.65 },
});
