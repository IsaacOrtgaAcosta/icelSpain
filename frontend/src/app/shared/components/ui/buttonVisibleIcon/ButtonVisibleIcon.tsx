import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import styles from './ButtonVisibleIcon.module.css';

interface ButtonVisibleIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    isVisible: boolean;
    passwordToggle: () => void;
}

export const ButtonVisibleIcon: React.FC<ButtonVisibleIconProps> = ({ isVisible, passwordToggle, className, ...rest }) => {
  return (
    <button onClick={passwordToggle} className= {`${styles.button} ${className ?? ""}`} {...rest}>
      {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
    </button>
  );
};
