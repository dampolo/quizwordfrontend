import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";
import { fonts } from "../../assets/fonts";

export const header = StyleSheet.create({
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.qwBorderColor,
    backgroundColor: colors.qwFourth,
  },
  mobileContainer: { paddingHorizontal: 32 },
  registerButton: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radius,
    backgroundColor: colors.qwPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: { color: colors.qwFourth, fontSize: 16, fontFamily: fonts.bold, textAlign: "center" },
  mobileLogin: {
    fontSize: 18,
    lineHeight: 27,
    fontFamily: fonts.bold,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brandLink: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 23, fontFamily: fonts.extraBold, color: colors.qwPrimary },
  navigation: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  link: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: colors.qwPrimary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  languages: { flexDirection: "row", gap: 8 },
  activeLanguage: {
    backgroundColor: colors.qwThird,
    borderRadius: radius,
    overflow: "hidden",
  },
});
