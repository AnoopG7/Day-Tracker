import type { ReactElement } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  type SelectProps as MuiSelectProps,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'children'> {
  options: SelectOption[];
  helperText?: string;
  placeholder?: string;
}

/** Enhanced select with options array */
export function Select({
  options,
  label,
  helperText,
  placeholder,
  error,
  fullWidth = true,
  value,
  ...props
}: SelectProps): ReactElement {
  // Check if a value is selected to determine if label should shrink
  const hasValue = value !== undefined && value !== '';

  return (
    <FormControl fullWidth={fullWidth} error={error}>
      {label && <InputLabel shrink={hasValue || !!placeholder}>{label}</InputLabel>}
      <MuiSelect
        label={label}
        value={value}
        displayEmpty={!!placeholder}
        notched={hasValue || !!placeholder}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default Select;
