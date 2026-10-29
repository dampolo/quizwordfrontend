import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const allQuizzesStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwBgQuiz },
  content: { padding: 16, paddingTop: 0, paddingBottom: 32 },
  languages: { gap: 8, paddingVertical: 16 },
  card: {
    padding: 16,
    marginBottom: 16,
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    backgroundColor: colors.qwFourth,
  },
  cardHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 },
  cardTitle: { flexShrink: 1, fontSize: 20, fontWeight: "700", color: colors.qwColorHeading },
  actions: { gap: 8 },
  action: { maxWidth: 240 },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.qwBorderColor,
  },
  metadata: { fontSize: 14, lineHeight: 22, color: colors.qwBodyTextColor },
  footer: { marginTop: 8 },
});
