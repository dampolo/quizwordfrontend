import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.qwThird,
    paddingVertical: 8,
    marginBottom: 16,
  },
  pressed: { opacity: 0.6 },
  action: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingRight: 10
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.qwPrimary,
  },
  icon: {
    color: colors.qwPrimary,
  }
});
