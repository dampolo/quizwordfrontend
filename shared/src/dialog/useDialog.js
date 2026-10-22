import { useContext } from "react";
import DialogContext from "./DialogContext.jsx";

export default function useDialog() {
  return useContext(DialogContext);
}