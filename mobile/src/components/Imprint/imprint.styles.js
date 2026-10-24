import { StyleSheet } from "react-native";
import { fonts } from "../../assets/fonts";
import { colors } from "../../styles/basic";

export const imprint = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.qwFourth },
  content: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
  heading: {
    marginTop: 12,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 29,
    color: colors.qwColorHeading,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colors.qwBodyTextColor,
  },
  strong: { fontFamily: fonts.bold },
  link: { color: colors.qwPrimary, textDecorationLine: "underline" },
});
