import { useEffect, useState } from "react";
import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser } from "@/app/features/auth/api/authApi";
import { authStorage } from "@/app/features/auth/authStorage";
import { useAuth } from "@/app/features/auth/context/auth-context";

type AuthenticationStatus = "checking" | "authenticated" | "unauthenticated";

export const ProtectedRoute = () => {
  const [status, setStatus] = useState<AuthenticationStatus>("checking");
  const { setUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const validateSession = async (): Promise<void> => {
      const accessToken = authStorage.getAccessToken();

      if (!accessToken) {
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser(accessToken);

        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) {
          authStorage.clearAccessToken();
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  if (status === "checking") {
    return (
      <Center mih="100vh">
        <Loader color="yellow" />
      </Center>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
