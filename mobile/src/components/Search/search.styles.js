import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const searchStyles = StyleSheet.create({
  search: {
    position: "relative",
    zIndex: 1,
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
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 12,
    zIndex: 1,
    gap: 8,
    padding: 12,
    backgroundColor: colors.qwFifth,
    borderRadius: 10,
  },
  searchResult: {
    paddingVertical: 8,
    gap: 4,
  },
  translation: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.qwColorHeading,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.qwBodyTextColor,
  },
});
