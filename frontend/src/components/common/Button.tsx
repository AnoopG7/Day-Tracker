import type { ReactElement, ReactNode } from 'react';
import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** Extended MUI Button with loading state and icons */
export function Button({
  children,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  disabled,
  startIcon,
  endIcon,
  ...props
}: ButtonProps): ReactElement {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : leftIcon || startIcon}
      endIcon={rightIcon || endIcon}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </MuiButton>
  );
}

export default Button;
