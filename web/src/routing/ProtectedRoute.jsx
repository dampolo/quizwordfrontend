import { Navigate, Outlet } from "react-router-dom";
import  { useAuth }  from "../context/auth/useAuth";
import PreLoader from "../components/PreLoader/PreLoader";
import VerifyEmailRequired from "../components/VerifyEmailRequired/VerifyEmailRequired";

export default function ProtectedRoute() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.is_email_verified === false) {
    return <VerifyEmailRequired />;
  }

  return <Outlet />;
}
