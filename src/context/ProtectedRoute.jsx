import { Navigate, Outlet } from "react-router-dom";
import  { useAuth }  from "./useAuth";
import PreLoader from "../components/PreLoader/PreLoader";

export default function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}