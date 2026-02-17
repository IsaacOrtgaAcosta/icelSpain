import { Box } from '@mui/material'
import { LoginForm } from '../../components/login-form/LoginForm'
import LogoIcel from '@/app/assets/logo/logotipo_icelspain.webp';
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
  return (
    <Box className={styles.container}>
      <Box>
        <img src={LogoIcel} alt="Logo de Icel" className={styles.logo}/>
      </Box>
      <LoginForm />
    </Box>
  )
}

