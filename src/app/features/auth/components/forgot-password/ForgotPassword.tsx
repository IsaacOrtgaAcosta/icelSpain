import { useState } from "react";
import {
  ActionIcon,
  Box,
  Card,
  Flex,
  Image,
  Title,
} from "@mantine/core";
import { ArrowFatLeftIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

import Imagotipo from "@/../public/images/imagotipo.webp";
import { ButtonProgress } from "@/app/shared/components/button/ButtonProgress";
import { FloatingLabelInput } from "@/app/shared/components/input/floating-input/FloatingLabelInput";

import styles from "./ForgotPassword.module.css";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  return (
    <Card
      shadow="md"
      padding="xl"
      radius="md"
      withBorder
      w={{ base: "calc(100vw - 32px)", sm: 440, md: 480 }}
      maw={480}
    >
      <Box>
        <ActionIcon
          component={Link}
          to="/"
          variant="transparent"
          color="charcoal"
          aria-label="Volver a la página de inicio"
        >
          <ArrowFatLeftIcon size={32} />
        </ActionIcon>
      </Box>

      <Flex direction="column" align="center" mb="md">
        <Box className={styles.loginFormLogoContainer}>
          <Image radius="xl" src={Imagotipo} alt="Imagotipo de ICEL" />
        </Box>

        <Box mt="lg">
          <Title order={2} ta="center" mb="md">
            Recuperar contraseña
          </Title>
        </Box>
      </Flex>

      <Box mb="md">
        <FloatingLabelInput
          label="Correo electrónico"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
      </Box>

      <Box mt="md">
        <ButtonProgress
          type="button"
          title="Solicitar nueva contraseña"
          inProgressTitle="Enviando solicitud"
          disabled={!email.trim()}
        />
      </Box>
    </Card>
  );
};