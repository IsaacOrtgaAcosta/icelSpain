import MuiButton, {type ButtonProps as MuiButtonProps } from '@mui/material/Button';

export const ButtonComponent: React.FC<MuiButtonProps> = ({
    className,
    ...rest
}) => {

    return (
        <MuiButton 
        {...rest} 
            className={className}>
        </MuiButton>
    )
}