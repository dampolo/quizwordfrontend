import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const allCategoriesStyles = StyleSheet.create({
  content: { padding: 16, paddingTop: 0, paddingBottom: 32 },
  languages: { gap: 8, paddingVertical: 16 },
  card: {
    backgroundColor: colors.qwFourth,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: colors.qwColorHeading,
  },
  editButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.qwThird,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  wordsButton: { minHeight: 48, justifyContent: "center" },
  wordCount: { color: colors.qwPrimary, fontSize: 16, fontWeight: "700" },
  languageName: { color: colors.qwBodyTextColor, fontSize: 14, flexShrink: 1 },
});
