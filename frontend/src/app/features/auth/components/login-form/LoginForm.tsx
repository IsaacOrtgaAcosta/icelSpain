import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextFieldComponent as TextField } from "@/app/shared/components/ui/text-field/TextField";
import { ButtonVisibleIcon } from "@/app/shared/components/ui/buttonVisibleIcon/ButtonVisibleIcon";
import { ButtonComponent } from "@/app/shared/components/ui/button/Button";
import { AlertComponent } from "@/app/shared/components/ui/alert/Alert";
import { Box, Link, Typography } from "@mui/material";
import usePasswordToggle from "@/app/shared/hooks/usePasswordToggle";
import login from "../../api/login";
import styles from "./LoginForm.module.css";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [payLoadLogin, setPayLoadLogin] = useState({
    user: "",
    password: "",
  });

  const [errorVisible, setErrorVisible] = useState<boolean>(false);
  const { type, visible, toggle } = usePasswordToggle();

  const sendPayLoadLogin = async () => {
    try {
      setErrorVisible(false);
      await login(payLoadLogin);
    } catch (error) {
      setErrorVisible(true);
    }
  };

  const handleRegisterRedirection = () => {
    navigate("plans");
  };

  return (
    <Box className={styles.form} sx={{ bgcolor: "background.default", p: 3, borderRadius: 1}}>
      <Typography variant="h5" gutterBottom sx={{color: "text.primary"}}>
        Iniciar sesión
      </Typography>
      {errorVisible ? (
        <AlertComponent severity="error" variant="filled" sx={{ mb: 2 }}>
          Hay campos vacíos. Escribe usuario y la contraseña para acceder.
        </AlertComponent>
      ) : (
        ""
      )}
      <TextField
        label={"email"}
        value={payLoadLogin.user}
        type="text"
        onChange={(e) =>
          setPayLoadLogin((prev) => ({
            ...prev,
            user: e.target.value,
          }))
        }
      ></TextField>
      <Box className={styles.inputWrapper}>
        <TextField
          label={"contraseña"}
          type={type}
          value={payLoadLogin.password}
          onChange={(e) =>
            setPayLoadLogin((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        ></TextField>
        <ButtonVisibleIcon
          isVisible={visible}
          passwordToggle={toggle}
          className={styles.buttonVisibleIcon}
        />
      </Box>
      <ButtonComponent
        color="secondary"
        type="submit"
        variant="contained"
        sx={{ width: "100%", mt: 2 }}
        onClick={sendPayLoadLogin}
      >
        Iniciar sesión
      </ButtonComponent>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }} onClick={handleRegisterRedirection}>
        <Link color="text.secondary" sx={{ cursor: "pointer", fontSize: "12px" }}>
          Aviso Legal
        </Link>
        <Link color="text.secondary" sx={{ cursor: "pointer", fontSize: "12px" }}>
          Política de privacidad
        </Link>
      </Box>
    </Box>
  );
};
