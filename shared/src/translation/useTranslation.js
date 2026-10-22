import { useContext } from "react";
import TranslationContext from "./TranslationContext.jsx";

export default function useTranslation() {
  return useContext(TranslationContext);
}
