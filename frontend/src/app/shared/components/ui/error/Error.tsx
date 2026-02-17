import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import styles from "./Error.module.css";
import ErrorImg from "@/assets/illustrations/error-illustration.svg";

type ErrorViewProps = {
    status: number | null,
};

export const ErrorView = ({status}: ErrorViewProps) => {

    const navigate = useNavigate();

  return (
    <Box className={styles.boxError}>
      <Card
        sx={{ display: "flex", flexDirection: "column" }}
        className={styles.card}
        data-idPlan={"1"}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box className={styles.boxTitle}>
            <Typography
              component="h1"
              sx={{ fontSize: "50px", fontWeight: "bold" }}
              className={styles.cardHeading}
            >
              {`Error ${status}`}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", mt: "auto", mb:"20px"}}>
            <Typography component="h3" sx={{fontSize: '22px'}}>
              Algo no ha ido como esperábamos. Estamos trabajando para
              solucionarlo
            </Typography>
          </Box>
          <img src={ErrorImg} alt="Error" className={styles.img} />
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
