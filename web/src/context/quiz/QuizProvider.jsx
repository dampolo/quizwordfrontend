import { QuizProvider as SharedProvider } from "@quizword/shared/quiz/provider";
import useApi from "../api/useApi";
import { apiFetch } from "../../services/apiFetch";
import { toast } from "react-toastify";

export function QuizProvider({ children }) {
  const api = useApi();
  return <SharedProvider api={api} apiFetch={apiFetch} onError={toast.error}>{children}</SharedProvider>;
}
