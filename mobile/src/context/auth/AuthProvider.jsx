import { AuthProvider as SharedAuthProvider } from "@quizword/shared/auth/provider";

// Set EXPO_PUBLIC_API_URL to the same backend used by the website.
// A native token session adapter can be supplied once the backend supports it.
export function AuthProvider({ children, session }) {
  return (
    <SharedAuthProvider api={process.env.EXPO_PUBLIC_API_URL} session={session}>
      {children}
    </SharedAuthProvider>
  );
}
