import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {

  const { userInfo } = useSelector((state) => state.auth);
  if (!userInfo) return <Navigate to="/auth/login" replace />;

  return allowedRoles.includes(userInfo.user_role) ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/unauthorized" replace />
  );


}

export default ProtectedRoute;