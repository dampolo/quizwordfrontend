import { VocabularyProvider as SharedProvider } from "@quizword/shared/vocabulary/provider";
import useApi from "../api/useApi";
import { apiFetch } from "../../services/apiFetch";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

function speak(word, language, { onStart, onEnd }) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = language;
  utterance.onstart = onStart;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function VocabularyProvider({ children }) {
  const api = useApi();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onLanguagesLoaded = (data) => {

    // Later
      if (!data.languages_active) {
    navigate("/my-quiz/choose-languages", { replace: true });
    return;
  }

  if (pathname === "/my-quiz" || pathname === "/my-quiz/") {
    navigate(
      `/my-quiz/all-words?language=${data.learning_languages?.[0]?.id}`,
      { replace: true },
    );
  }
    // Later


    

    // navigate(
    //   data.languages_active
    //     ? `/my-quiz/all-words?language=${data.learning_languages?.[0]?.id}`
    //     : "/my-quiz/choose-languages",
    //   { replace: true },
    // );
  };
  return (
    <SharedProvider
      api={api}
      apiFetch={apiFetch}
      onError={toast.error}
      onLanguagesLoaded={onLanguagesLoaded}
      speak={speak}
    >
      {children}
    </SharedProvider>
  );
}
