import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Center,
  Loader,
  Stack,
} from "@mantine/core";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  AuthApiError,
  getCurrentUser,
} from "@/app/features/auth/api/authApi";
import { useAuth } from "@/app/features/auth/context/auth-context";

type AuthenticationStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "connection-error";

export const ProtectedRoute = () => {
  const [status, setStatus] =
    useState<AuthenticationStatus>("checking");
  const [validationAttempt, setValidationAttempt] = useState(0);

  const { setUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    const validateSession = async (): Promise<void> => {
      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        setUser(null);

        if (
          error instanceof AuthApiError &&
          (error.status === 0 || error.status >= 500)
        ) {
          setStatus("connection-error");
        } else {
          setStatus("unauthenticated");
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [setUser, validationAttempt]);

  if (status === "checking") {
    return (
      <Center mih="100vh">
        <Loader color="yellow" />
      </Center>
    );
  }

  if (status === "connection-error") {
    return (
      <Center mih="100vh" p="md">
        <Stack maw={420}>
          <Alert
            color="red"
            title="No se pudo comprobar la sesión"
          >
            Comprueba que el servidor está funcionando e
            inténtalo de nuevo.
          </Alert>

          <Button
            color="yellow"
            c="black"
            onClick={() => {
              setStatus("checking");
              setValidationAttempt(
                (currentAttempt) => currentAttempt + 1,
              );
            }}
          >
            Reintentar
          </Button>
        </Stack>
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