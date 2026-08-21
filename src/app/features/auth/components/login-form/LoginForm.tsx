import { useState } from "react";
import type { FormEvent } from "react";
import { Alert, Anchor, Box, Card, Flex, Image, Title } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import Imagotipo from "@/../public/images/imagotipo.webp";
import { login, AuthApiError } from "../../api/authApi";
import { authStorage } from "../../authStorage";
import { ButtonProgress } from "@/app/shared/components//button/ButtonProgress";

import {
  FloatingLabelInput,
  PasswordField,
} from "@/app/shared/components/input/floating-input/FloatingLabelInput";

import styles from "./LoginForm.module.css";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await login({
        email: email.trim(),
        password,
      });

      authStorage.setAccessToken(token.access_token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      component="form"
      onSubmit={handleSubmit}
      shadow="md"
      padding="xl"
      radius="md"
      withBorder
      w={{ base: "calc(100vw - 32px)", sm: 400, md: 480 }}
      maw={480}
    >
      <Flex direction="column" align="center" mb="md">
        <Box className={styles.imagotipoContainer}>
          <Image radius="xl" src={Imagotipo} alt="Imagotipo de ICEL" />
        </Box>
        <Box mt="lg">
          <Title order={2} ta="center" mb="md">
            Iniciar sesión
          </Title>
        </Box>
        <Box mb="md" w="100%">
          <FloatingLabelInput
            label="Correo electrónico"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />
        </Box>
        <Box mb="md" w="100%">
          <PasswordField
            label="Contraseña"
            value={password}
            onChange={setPassword}
            required
          />
        </Box>

        {errorMessage && (
          <Alert color="red" mb="md">
            {errorMessage}
          </Alert>
        )}

        <Box mb="md" w="100%">
          <ButtonProgress
            title="Iniciar sesión"
            type="submit"
            inProgressTitle="Iniciando sesión..."
            loading={isSubmitting}
            disabled={!email.trim() || !password.trim() || isSubmitting}
          />
        </Box>
        <Box mt="md" ta="center">
          <Anchor
            component={Link}
            to="/auth/forgot-password"
            size="sm"
            c="charcoal.7"
          >
            ¿Olvidaste tu contraseña?
          </Anchor>
        </Box>
      </Flex>
    </Card>
  );
};
