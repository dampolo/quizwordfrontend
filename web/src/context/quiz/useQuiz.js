import { useContext } from "react";
import QuizContext from "./QuizContext";


export default function useQuiz() {
    return useContext(QuizContext)
}