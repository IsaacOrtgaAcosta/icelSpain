import { Box } from "@mantine/core";
import { ForgotPassword } from "../../components/forgot-password/ForgotPassword";
import styles from "./ForgotPasswordPage.module.css";

export const ForgotPasswordPage = () => {
  return (
    <Box className={styles.container}>
      <ForgotPassword />
    </Box>
  );
};
