import { StyleSheet } from "react-native";
import { colors } from "./basic";

export const tabColors = {
  active: "#245c45",
  inactive: "#647067",
  activeBackground: colors.qwSixth,
};

export const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.qwThird,
    borderTopColor: "#dce4d7",
  },
  tabBarItem: {
    borderRadius: 12,
    overflow: "hidden",
  },
  editWordTabItem: {
    display: "none",
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
});
