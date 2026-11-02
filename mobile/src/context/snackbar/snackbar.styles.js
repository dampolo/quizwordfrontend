import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const snackbarStyles = StyleSheet.create({
  error: { backgroundColor: "#b91c1c" },
  success: { backgroundColor: "#15803d" },
});

export const coloredSnackbarTheme = {
  colors: {
    inverseOnSurface: colors.qwFourth,
    inversePrimary: colors.qwFourth,
  },
};
