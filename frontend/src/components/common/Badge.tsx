import type { ReactElement } from 'react';
import { Chip, type ChipProps } from '@mui/material';

export type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'primary'
  | 'secondary';

export interface BadgeProps {
  label: string;
  colorVariant?: BadgeVariant;
  chipVariant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  icon?: React.ReactElement;
  onDelete?: () => void;
  onClick?: () => void;
}

const variantToColor: Record<BadgeVariant, ChipProps['color']> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'default',
  primary: 'primary',
  secondary: 'secondary',
};

/** Status badge component */
export function Badge({
  label,
  colorVariant = 'default',
  chipVariant = 'filled',
  size = 'small',
  icon,
  onDelete,
  onClick,
}: BadgeProps): ReactElement {
  return (
    <Chip
      size={size}
      label={label}
      color={variantToColor[colorVariant]}
      variant={chipVariant}
      icon={icon}
      onDelete={onDelete}
      onClick={onClick}
    />
  );
}

export default Badge;
