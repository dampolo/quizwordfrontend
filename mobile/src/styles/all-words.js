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
    paddingVertical: 12,
    backgroundColor: colors.qwThird,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.qwBodyTextColor,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.qwBorderColor,
  },
  checkColumn: {
    width: 36,
    alignItems: "center",
    textAlign: "center",
  },
  rankColumn: {
    width: 48,
    textAlign: "center",
  },
  wordColumn: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    gap: 4,
  },
  actionsColumn: {
    width: 52,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  rankText: {
    fontSize: 12,
    color: colors.qwBodyTextColor,
  },
  sourceWord: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.qwColorHeading,
  },
  translation: {
    fontSize: 14,
    color: colors.qwBodyTextColor,
  },
});
