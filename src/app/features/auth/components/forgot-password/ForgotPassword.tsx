import { Card, Flex, Title, Box, Image, ActionIcon } from "@mantine/core"
import { Link } from "react-router-dom";
import {FloatingLabelInput} from "@/app/shared/components/input/floating-input/FloatingLabelInput";
import {ButtonProgress} from "@/app/shared/components/button/ButtonProgress";
import styles from "@/app/features/auth/components/forgot-password/ForgotPassword.module.css";
import Imagotipo from "@/../public/images/imagotipo.webp";
import { ArrowFatLeftIcon } from '@phosphor-icons/react';

export const ForgotPassword = () => {
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
        <Box>
            <ActionIcon 
            component={Link} to="/" variant="transparent" color="charcoal" aria-label="Volver a la página de inicio"
            >
            <ArrowFatLeftIcon size={32} cursor="pointer" />
            </ActionIcon>
        </Box>
        <Flex direction="column" align="center" mb="md">
          <Box className={styles.loginFormLogoContainer}>
            <Image radius="xl" src={Imagotipo} alt="Imagotipo" />
          </Box>
          <Box mt="lg">
            <Title order={2} ta="center" mb="md">
              Recuperar contraseña
            </Title>
          </Box>
        </Flex>
        <Box mb="md">
          <FloatingLabelInput label="Email" required />
        </Box>
        <Box mt="md">
          <ButtonProgress
            title="Solicitar nueva contraseña"
            inProgressTitle="Enviando solicitud"
            progressFinished="Solicitud enviada a su email"
          />
        </Box>
      </Card>
    </>
  )
}
