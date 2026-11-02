import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";

export const profileStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwBgQuiz },
  content: {
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 24,
  },
  previewNotice: {
    color: colors.qwBodyTextColor,
    fontSize: 14,
    lineHeight: 22,
  },
  section: { gap: 12 },
  sectionTitle: {
    color: colors.qwColorHeading,
    fontSize: 20,
    fontWeight: "700",
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: radius,
    backgroundColor: colors.qwFourth,
    gap: 16,
  },
  avatar: { alignSelf: "center", borderRadius: 50, overflow: "hidden" },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  row: { gap: 6 },
  label: { color: colors.qwBodyTextColor, fontSize: 14, lineHeight: 21 },
  value: {
    color: colors.qwColorHeading,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    flexShrink: 1,
  },
  body: { color: colors.qwBodyTextColor, fontSize: 16, lineHeight: 25 },
  button: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius,
    backgroundColor: colors.qwThird,
    opacity: 0.55,
  },
  buttonText: { color: colors.qwPrimary, fontSize: 16, fontWeight: "600" },
  deleteButton: {
    backgroundColor: colors.qwFourth,
    borderWidth: 1,
    borderColor: colors.qwRequired,
  },
  deleteButtonText: { color: colors.qwRequired },
});
