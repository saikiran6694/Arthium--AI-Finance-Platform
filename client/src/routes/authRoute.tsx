import { useTypedSelector } from "@/app/hook";
import { Navigate, Outlet } from "react-router-dom";
import { PROTECTED_ROUTES } from "./common/routePath";
import { shallowEqual } from "react-redux";

const AuthRoute = () => {
  const {access_token, user} = useTypedSelector((state) => state.auth, shallowEqual)

  if (!access_token && !user) return <Outlet />;

  return <Navigate to={PROTECTED_ROUTES.OVERVIEW} replace />;
};

export default AuthRoute;
