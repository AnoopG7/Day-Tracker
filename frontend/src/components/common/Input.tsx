import { useState, type ReactElement } from 'react';
import {
  TextField as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import type { ReactNode } from 'react';

export interface InputProps extends Omit<MuiTextFieldProps, 'variant'> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  showPasswordToggle?: boolean;
}

/** Styled TextField with adornment support and password visibility toggle */
export function Input({
  startAdornment,
  endAdornment,
  showPasswordToggle = false,
  type: typeProp,
  InputProps: inputProps,
  ...props
}: InputProps): ReactElement {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  // Determine the actual type
  const isPasswordField = typeProp === 'password' && showPasswordToggle;
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : typeProp;

  // Build end adornment with password toggle if needed
  const finalEndAdornment = isPasswordField ? (
    <InputAdornment position="end">
      <IconButton
        onClick={handleTogglePasswordVisibility}
        edge="end"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
      {endAdornment}
    </InputAdornment>
  ) : endAdornment ? (
    <InputAdornment position="end">{endAdornment}</InputAdornment>
  ) : (
    inputProps?.endAdornment
  );

  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      type={inputType}
      InputProps={{
        ...inputProps,
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : (
          inputProps?.startAdornment
        ),
        endAdornment: finalEndAdornment,
      }}
      {...props}
    />
  );
}

export default Input;
