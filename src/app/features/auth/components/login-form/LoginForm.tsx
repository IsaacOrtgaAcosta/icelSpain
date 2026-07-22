import { FloatingLabelInput } from "@/app/shared/components/input/floating-input/FloatingLabelInput";
import { Box, Card, Image, Title, Flex, Anchor } from "@mantine/core";
import Imagotipo from "@/../public/images/imagotipo.webp";
import styles from "./LoginForm.module.css";
import { ButtonProgress } from "@/app/shared/components/button/ButtonProgress";
import { PasswordField } from "@/app/shared/components/input/floating-input/FloatingLabelInput";
import { Link } from "react-router-dom";
export const LoginForm = () => {
  return (
    <>
      <Card
        shadow="md"
        padding="xl"
        radius="md"
        withBorder
        w={{ base: "calc(100vw - 32px)", sm: 440, md: 480 }}
        maw={480}
      >
        <Flex direction="column" align="center" mb="md">
          <Box className={styles.loginFormLogoContainer}>
            <Image radius="xl" src={Imagotipo} alt="Imagotipo" />
          </Box>
          <Box mt="lg">
            <Title order={2} ta="center" mb="md">
              Login
            </Title>
          </Box>
        </Flex>
        <Box mb="md">
          <FloatingLabelInput label="Usuario" required />
        </Box>
        <Box mb="md">
          <PasswordField label="Contraseña" required />
        </Box>
        <Box mt="md">
          <ButtonProgress
            title="Iniciar sesión"
            inProgressTitle="Iniciando sesión"
            progressFinished="Sesión iniciada"
          />
        </Box>
        <Box mt="md" ta="center">
          <Anchor component={Link} to="/auth/forgot-password" size="sm" c="charcoal.7">
            ¿Olvidaste tu contraseña?
          </Anchor>
        </Box>
      </Card>
    </>
  );
};
