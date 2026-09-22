import { useContext } from "react";
import DialogContext from "./DialogContext";

export default function useDialog() {
  return useContext(DialogContext);
}