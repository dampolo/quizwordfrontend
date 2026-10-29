import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";

// Keep the web results' distinct success and error colors local to this screen.
export const quizResultsStyles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, width: "100%", maxWidth: 760, alignSelf: "center" },
  header: { gap: 16, padding: 20, marginBottom: 16, borderRadius: radius, backgroundColor: colors.qwFifth },
  headingRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700", color: colors.qwColorHeading },
  badge: { fontSize: 12, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.qwBorderColor, borderRadius: radius, backgroundColor: colors.qwFourth, color: colors.qwBodyTextColor },
  summary: { fontSize: 18, fontWeight: "700", color: colors.qwColorHeading },
  message: { fontSize: 16, lineHeight: 24, color: colors.qwBodyTextColor },
  row: { padding: 20, gap: 12, marginBottom: 12, borderRadius: radius, backgroundColor: colors.qwFourth },
  wrongRow: { backgroundColor: "#fff7f7" },
  status: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusIcon: { width: 22, height: 22, borderRadius: 11, overflow: "hidden", fontSize: 13, lineHeight: 22, textAlign: "center", fontWeight: "700", color: colors.qwFourth },
  successIcon: { backgroundColor: "#16a34a" },
  errorIcon: { backgroundColor: "#dc2626" },
  column: { gap: 5 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: colors.qwBodyTextColor },
  word: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: colors.qwColorHeading },
  answer: { fontSize: 18, lineHeight: 26 },
  correct: { color: "#0f8f54", fontWeight: "600" },
  incorrect: { color: "#d14343", textDecorationLine: "line-through" },
  incorrectStatus: { color: "#d14343", fontWeight: "600" },
  footer: { gap: 12, marginTop: 12 },
});
