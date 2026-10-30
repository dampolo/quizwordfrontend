import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";

export const previewQuizStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.qwSeventh,
  },
  dialog: {
    width: "100%",
    maxWidth: 800,
    maxHeight: "90%",
    alignSelf: "center",
    backgroundColor: colors.qwFourth,
    borderRadius: radius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    gap: 8,
    backgroundColor: colors.qwFifth,
  },
  title: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.qwColorHeading,
  },
  list: { flexGrow: 0, flexShrink: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.qwBorderColor,
  },
  words: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  source: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.qwPrimary,
    flexShrink: 1,
  },
  translation: { fontSize: 16, color: colors.qwBodyTextColor, flexShrink: 1 },
  action: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
  },
  message: { padding: 16, gap: 16, color: colors.qwBodyTextColor },
});
