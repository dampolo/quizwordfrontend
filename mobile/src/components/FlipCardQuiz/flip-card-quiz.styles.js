import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";

export const flipCardQuizStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwSeventh },
  content: { flexGrow: 1, justifyContent: "center", padding: 16, paddingBottom: 32 },
  frame: { width: "100%", maxWidth: 760, alignSelf: "center" },
  card: { width: "100%", borderWidth: 1, borderColor: colors.qwBorderColor, borderRadius: radius, backgroundColor: colors.qwFourth },
  face: { padding: 24, gap: 24 },
  backFace: { transform: [{ rotateY: "180deg" }] },
  progress: { position: "absolute", top: -1, left: -1, right: -1, height: 7, borderTopLeftRadius: radius, borderTopRightRadius: radius, overflow: "hidden", backgroundColor: colors.qwThird },
  progressFill: { height: "100%", backgroundColor: colors.qwPrimary },
  quizName: { position: "absolute", left: -52, top: "50%", marginTop: -8, width: 120, height: 16, fontSize: 10, lineHeight: 16, textAlign: "center", color: colors.qwBodyTextColor, transform: [{ rotate: "-90deg" }] },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  languages: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.qwBodyTextColor },
  body: { gap: 24 },
  soundRow: { alignItems: "center" },
  wordArea: { minHeight: 88, alignItems: "center", justifyContent: "center" },
  word: { maxWidth: "100%", paddingHorizontal: 8, fontSize: 32, lineHeight: 44, textAlign: "center", color: colors.qwColorHeading, backgroundColor: colors.qwFourth },
  backWord: { color: colors.qwPrimary },
  line: { position: "absolute", width: "100%", maxWidth: 256, height: 1, backgroundColor: colors.qwBorderColor },
  sentence: { fontSize: 16, lineHeight: 24, textAlign: "center", color: colors.qwBodyTextColor },
  buttons: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  navigationButton: { width: 56, minHeight: 56, paddingHorizontal: 8, paddingVertical: 8 },
  iconButton: { minWidth: 56, minHeight: 56, alignItems: "center", justifyContent: "center", borderRadius: radius, backgroundColor: colors.qwFourth },
  speaking: { backgroundColor: colors.qwThird },
  messageContainer: { paddingVertical: 24, gap: 24 },
  message: { fontSize: 16, lineHeight: 24, textAlign: "center", color: colors.qwBodyTextColor },
});
