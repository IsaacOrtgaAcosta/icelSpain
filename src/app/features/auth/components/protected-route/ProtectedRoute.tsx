import { useEffect, useState } from "react";
import { Center, Loader } from "@mantine/core";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { getCurrentUser } from "@/app/features/auth/api/authApi";
import { authStorage } from "@/app/features/auth/authStorage";

type AuthenticationStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated";

export const ProtectedRoute = () => {
  const [status, setStatus] =
    useState<AuthenticationStatus>("checking");

  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const validateSession = async (): Promise<void> => {
      const accessToken = authStorage.getAccessToken();

      if (!accessToken) {
        setStatus("unauthenticated");
        return;
      }

      try {
        await getCurrentUser(accessToken);

        if (!cancelled) {
          setStatus("authenticated");
        }
      } catch {
        authStorage.clearAccessToken();

        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <Center mih="100vh">
        <Loader color="yellow" />
      </Center>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};