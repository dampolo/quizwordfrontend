import { useContext } from "react";
import VocabularyContext from "./VocabularyContext.jsx";

export default function useVocabulary() {
  return useContext(VocabularyContext);
}