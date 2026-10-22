import { useContext } from "react";
import VocabularyContext from "./VocabularyContext";

export default function useVocabulary() {
  return useContext(VocabularyContext);
}