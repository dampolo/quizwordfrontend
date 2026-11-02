import { StyleSheet } from "react-native";
import { colors, radius } from "../../../styles/basic";

export const changeProfileImageStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwBgQuiz },
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
    backgroundColor: colors.qwFourth,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.qwColorHeading },
  body: { fontSize: 16, lineHeight: 24, color: colors.qwBodyTextColor },
  avatar: { alignSelf: "center", borderRadius: 60, overflow: "hidden" },
  image: { width: 120, height: 120 },
  button: {
    minHeight: 48,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
    backgroundColor: colors.qwPrimary,
  },
  buttonText: { color: colors.qwFourth, fontSize: 16, fontWeight: "600" },
  deleteButton: {
    minHeight: 48,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.qwRequired,
  },
  error: { color: colors.qwRequired, fontSize: 16, lineHeight: 24 },
  disabled: { opacity: 0.45 },
});
