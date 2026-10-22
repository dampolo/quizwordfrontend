import { useContext } from "react";
import QuizContext from "./QuizContext.jsx";


export default function useQuiz() {
    return useContext(QuizContext)
}