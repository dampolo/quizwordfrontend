import { StyleSheet } from "react-native";
import { colors } from "./basic";
import { tabColors } from "./my-quiz-tabs";

export const allWordsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.qwBgQuiz,
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
    backgroundColor: colors.qwFourth
  },
  loadingRow: {
    justifyContent: "center",
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
  vocabularyHeader: {
    gap: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700",
    color: colors.qwColorHeading,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.qwBodyTextColor,
  },
  search: {
    gap: 12,
  },
  searchInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.qwBorderColor,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.qwColorHeading,
    backgroundColor: colors.qwFourth,
  },
  searchResults: {
    gap: 8,
    padding: 12,
    backgroundColor: colors.qwFifth,
    borderRadius: 10,
  },
  searchResult: {
    paddingVertical: 8,
    gap: 4,
  },
  createButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  createButton: {
    flexGrow: 1,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.qwPrimary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.qwFourth,
  },
});
