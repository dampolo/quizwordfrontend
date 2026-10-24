import { Redirect } from "expo-router";
import { useAuth } from "../context/auth/useAuth";
import PreLoader from "../components/PreLoader/pre-loader";

export default function Index() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <PreLoader />;

  return (
    <Redirect
      href={
        isAuthenticated
          ? "/my-quiz/all-words"
          : "/quiz/(auth)/login-quiz"
      }
    />
  );
}