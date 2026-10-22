import { useContext } from "react";
import TranslationContext from "./TranslationContext";

export default function useTranslation() {
  return useContext(TranslationContext);
}
