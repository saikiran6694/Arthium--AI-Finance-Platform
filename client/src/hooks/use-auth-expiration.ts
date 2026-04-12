import { useEffect } from "react";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { logout, updateCredentials } from "@/features/auth/authSlice";
import { useRefreshMutation } from "@/features/auth/authAPI";

const useAuthExpiration = () => {
  const { access_token, expires_at, refresh_token } = useTypedSelector(
    (state) => state.auth
  );

  const dispatch = useAppDispatch();
  const [refreshToken] = useRefreshMutation();

  useEffect(() => {
    if (!access_token || !expires_at || !refresh_token) return;

    const handleLogout = () => {
      console.log("Session expired → logging out");
      dispatch(logout());
    };

    const handleTokenRefresh = async () => {
      try {
        const res = await refreshToken({ refresh_token }).unwrap();

        dispatch(
          updateCredentials({
            access_token: res.access_token,
            expires_in: res.expires_in,
          })
        );

        console.log("Token refreshed ✅");
      } catch (error) {
        console.error("Refresh failed ❌", error);
        handleLogout();
      }
    };

    const now = Date.now();

    const refreshTime = expires_at - now - 60 * 1000;

    if (refreshTime <= 0) {
      handleTokenRefresh();
      return;
    }

    const timer = setTimeout(handleTokenRefresh, refreshTime);

    return () => clearTimeout(timer);
  }, [access_token, expires_at, refresh_token, dispatch, refreshToken]);
};

export default useAuthExpiration;