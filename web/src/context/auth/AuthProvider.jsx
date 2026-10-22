import { useState } from "react";
import { AuthContext } from "@quizword/shared/auth/context";
import { AuthProvider as SharedAuthProvider } from "@quizword/shared/auth/provider";
import { useAuth } from "@quizword/shared/auth/useAuth";
import { toast } from "react-toastify";
import useApi from "../api/useApi";

const onProfileError = () => toast.error("Your profile could not be loaded. Please try again.");

function WebAuthState({ children }) {
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  return (
    <AuthContext.Provider value={{ ...auth, isMenuOpen, setIsMenuOpen, confirmationMessage, setConfirmationMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  const api = useApi();
  return (
    <SharedAuthProvider api={api} onProfileError={onProfileError}>
      <WebAuthState>{children}</WebAuthState>
    </SharedAuthProvider>
  );
}
