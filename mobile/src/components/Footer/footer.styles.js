import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";
import { fonts } from "../../assets/fonts";

export const footer = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.qwBorderColor,
    paddingVertical: 40,
    backgroundColor: "#f9fafb",
  },
  container: { gap: 40, paddingHorizontal: 32, alignItems: "center" },
  desktop: { flexDirection: "row", justifyContent: "space-between" },
  brandGroup: { maxWidth: 260, alignItems: "center" },
  brand: {
    fontSize: 28.8,
    lineHeight: 43.2,
    fontFamily: fonts.extraBold,
    color: colors.qwPrimary,
    marginBottom: 10,
  },
  copyright: {
    fontSize: 15.2,
    lineHeight: 25.84,
    fontFamily: fonts.regular,
    color: colors.qwBodyTextColor,
    textAlign: "center",
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 36,
    rowGap: 14,
    flexShrink: 1,
  },
  link: {
    minHeight: 44,
    paddingVertical: 11,
    color: colors.qwBodyTextColor,
    fontFamily: fonts.regular,
    fontSize: 15.2,
    lineHeight: 22.8,
    textAlign: "center",
  },
  socials: { flexDirection: "row", gap: 14 },
  social: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,70,229,0.08)",
  },
  feedback: {
    color: colors.qwBodyTextColor,
    textAlign: "center",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
