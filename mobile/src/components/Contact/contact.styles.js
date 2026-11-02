import { StyleSheet } from "react-native";
import { colors, radius } from "../../styles/basic";
import { fonts } from "../../assets/fonts";

export const contactStyles = StyleSheet.create({
  form: { maxWidth: 606, alignSelf: "center", backgroundColor: colors.qwThird, padding: 16, borderRadius: radius },
  input: { paddingHorizontal: 16 },
  message: { minHeight: 160, textAlignVertical: "top" },
  invalid: { borderColor: colors.qwRequired },
  counter: { alignSelf: "flex-end", color: colors.qwBodyTextColor, fontFamily: fonts.regular, fontSize: 14 },
  consent: { flex: 1, lineHeight: 24 },
  submit: { width: "100%" },
});

