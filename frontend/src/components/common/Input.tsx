import type { ReactElement } from 'react';
import {
  TextField as MuiTextField,
  type TextFieldProps as MuiTextFieldProps,
  InputAdornment,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface InputProps extends Omit<MuiTextFieldProps, 'variant'> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

/** Styled TextField with adornment support */
export function Input({
  startAdornment,
  endAdornment,
  InputProps: inputProps,
  ...props
}: InputProps): ReactElement {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      InputProps={{
        ...inputProps,
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : (
          inputProps?.startAdornment
        ),
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : (
          inputProps?.endAdornment
        ),
      }}
      {...props}
    />
  );
}

export default Input;
