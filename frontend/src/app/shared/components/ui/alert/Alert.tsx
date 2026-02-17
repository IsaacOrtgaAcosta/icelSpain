import Alert, { type AlertProps as MuiAlertProps } from "@mui/material/Alert";


interface AlertComponentProps extends MuiAlertProps {
}

export const AlertComponent: React.FC<AlertComponentProps> = ({
  className,
  ...rest
}) => {
  return (
    <>
      <Alert
      {...rest}
      className={className}
      ></Alert>
    </>
  );
};
