import { StyleSheet } from "react-native";
import { colors } from "./basic";
import { tabColors } from "./my-quiz-tabs";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.qwFourth,
  },
  content: {
    padding: 16,
  },
  languages: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 16,
  },
  language: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.qwThird,
    maxWidth: "100%",
  },
  languageActive: {
    backgroundColor: tabColors.activeBackground,
  },
  languagePressed: {
    opacity: 0.7,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "700",
    color: tabColors.inactive,
  },
  languageTextActive: {
    color: tabColors.active,
  },
  message: {
    color: colors.qwBodyTextColor,
    marginVertical: 16,
  },
  listHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: colors.qwFifth,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8b929b",
    textTransform: "uppercase",
    lineHeight: 18,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.qwBorderColor,
  },
  checkColumn: {
    width: 30,
    alignItems: "center",
    textAlign: "center",
  },
  rankColumn: {
    width: 48,
    textAlign: "center",
    color: colors.qwPrimary,
  },
  wordColumn: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  actionsColumn: {
    width: 72,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.qwPrimary,
  },
  sourceWord: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.qwPrimary,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.qwColorHeading,
  },
  translationArrow: {
    color: "#8b929b",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 3,
  },
});
