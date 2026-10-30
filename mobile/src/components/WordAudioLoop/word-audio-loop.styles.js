import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";

export const wordAudioLoopStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwSeventh },
  content: { flexGrow: 1, justifyContent: "center", padding: 16, paddingBottom: 32, gap: 20 },
  card: { width: "100%", maxWidth: 760, alignSelf: "center", padding: 24, gap: 24, borderWidth: 1, borderColor: colors.qwBorderColor, borderRadius: radius, backgroundColor: colors.qwFourth },
  progress: { position: "absolute", top: -1, left: -1, right: -1, height: 7, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: "hidden", backgroundColor: colors.qwThird },
  progressFill: { height: "100%", backgroundColor: colors.qwPrimary },
  quizName: { position: "absolute", left: -52, top: "50%", marginTop: -8, width: 120, height: 16, fontSize: 10, lineHeight: 16, textAlign: "center", color: colors.qwBodyTextColor, transform: [{ rotate: "-90deg" }] },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  languages: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.qwBodyTextColor },
  body: { gap: 28 },
  source: { fontSize: 20, lineHeight: 30, fontWeight: "700", textAlign: "center", color: colors.qwColorHeading },
  answerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  answer: { flex: 1, minWidth: 0, minHeight: 64, alignItems: "center", justifyContent: "center" },
  line: { position: "absolute", width: "100%", maxWidth: 256, height: 1, backgroundColor: colors.qwBorderColor },
  target: { maxWidth: "100%", paddingHorizontal: 8, fontSize: 32, lineHeight: 44, textAlign: "center", color: colors.qwPrimary, backgroundColor: colors.qwFourth },
  speaking: { backgroundColor: colors.qwFifth },
  message: { fontSize: 16, lineHeight: 24, textAlign: "center", color: colors.qwBodyTextColor },
  wakeMessage: { fontSize: 13, lineHeight: 20, textAlign: "center", color: colors.qwPrimary },
});
