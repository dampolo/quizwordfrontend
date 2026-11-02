import { StyleSheet } from "react-native";
import { colors, radius } from "../../../styles/basic";

export const editLanguagesStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwBgQuiz },
  flex: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: radius,
    backgroundColor: colors.qwFourth,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.qwColorHeading },
  body: { fontSize: 16, lineHeight: 24, color: colors.qwBodyTextColor },
  label: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: colors.qwColorHeading,
  },
  options: { gap: 8 },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: radius,
  },
  selectedOption: {
    backgroundColor: colors.qwThird,
    borderColor: colors.qwPrimary,
  },
  symbol: { fontSize: 24, color: colors.qwPrimary },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.qwColorHeading,
  },
  disabled: { opacity: 0.5 },
  error: { fontSize: 14, lineHeight: 22, color: colors.qwRequired },
});
