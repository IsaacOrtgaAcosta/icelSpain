import { Button } from "@mantine/core";
import classes from "./ButtonProgress.module.css";

export type ButtonProgressProps = {
  title?: string;
  inProgressTitle?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export const ButtonProgress = ({
  title,
  inProgressTitle,
  loading = false,
  disabled = false,
  type,
  onClick,
}: ButtonProgressProps) => {
  return (
    <Button
      type={type}
      fullWidth
      className={classes.button}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      radius="md"
    >
      {loading ? inProgressTitle : title}
    </Button>
  );
};
