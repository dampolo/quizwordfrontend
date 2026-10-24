import { StyleSheet } from "react-native";
import { colors, radius } from "./basic";
import { fonts } from "../assets/fonts";

export const priceStyles = StyleSheet.create({
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
});
