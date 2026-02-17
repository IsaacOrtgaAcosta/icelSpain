import { Box, CircularProgress } from "@mui/material";
import styles from './Loading.module.css';

export const Loading = () => {
  return (
    <Box className={styles.box}>
        <CircularProgress size={80}/>
    </Box>
  )
}