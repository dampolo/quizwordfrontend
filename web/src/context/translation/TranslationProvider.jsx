import { TranslationProvider as SharedProvider } from "@quizword/shared/translation/provider";
import useApi from "../api/useApi";
import { apiFetch } from "../../services/apiFetch";
import { toast } from "react-toastify";

export function TranslationProvider({ children }) {
  const api = useApi();
  return <SharedProvider api={api} apiFetch={apiFetch} onError={toast.error}>{children}</SharedProvider>;
}
