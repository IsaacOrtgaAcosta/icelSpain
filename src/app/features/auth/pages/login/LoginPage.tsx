
import { LoginForm } from "../../components/login-form/LoginForm";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
  return (
    <>
      <div className={styles.container}>
          <LoginForm />
      </div>
    </>
  )
}

