import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';

import styles from "./Card.module.css";

type DirectionVariant = "column" | "row";

interface OutlineCardProps extends MuiCardProps {
direction?: DirectionVariant;
}

export const Card: React.FC<OutlineCardProps> = ({
direction="column",
className,
children
}) => {
    const variantDirection = styles[direction];
    return (
        <MuiCard
        className={`${styles.base} ${variantDirection} ${className ?? ""}`}
        >
            {children}
        </MuiCard>
    )
}