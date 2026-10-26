import { StyleSheet } from "react-native";
import { colors } from "../../styles/basic";

export const createQuizModalStyles = StyleSheet.create({
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
  input: {
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
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dialogScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    borderRadius: 16,
    backgroundColor: colors.qwFourth,
  },
  dialogActions: {
    flexDirection: "column",
    gap: 12,
  },
  dialogButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    textAlign: "center",
  },
  dialogCancelButton: {
    backgroundColor: "transparent",
    borderColor: "#dfe3ef",
  },
  dialogCancelText: {
    color: "#5B5CE2",
  },
  dialogSaveButton: {
    backgroundColor: colors.qwPrimary,
    borderColor: colors.qwPrimary,
  },
  dialogSaveText: {
    color: "#f4f4f4",
  },
});
