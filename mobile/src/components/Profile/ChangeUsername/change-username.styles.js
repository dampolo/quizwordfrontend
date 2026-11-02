import { StyleSheet } from "react-native";
import { colors, radius } from "../../../styles/basic";

export const changeUsernameStyles = StyleSheet.create({
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
  field: { gap: 8 },
  label: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: colors.qwColorHeading,
  },
  input: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: radius,
    fontSize: 16,
    color: colors.qwColorHeading,
    backgroundColor: colors.qwFourth,
  },
  invalidInput: { borderColor: colors.qwRequired },
  hint: { fontSize: 14, lineHeight: 22, color: colors.qwBodyTextColor },
  error: { fontSize: 14, lineHeight: 22, color: colors.qwRequired },
});
