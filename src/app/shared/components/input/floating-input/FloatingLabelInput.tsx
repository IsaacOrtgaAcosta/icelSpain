import { useState } from 'react';
import { TextInput, PasswordInput } from '@mantine/core';
import classes from './FloatingLabelInput.module.css';

export type FloatingLabelInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ label, value, onChange, required, error, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <TextInput
      label={label}
      required={required}
      classNames={classes}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      error={error}
      autoComplete={autoComplete}
      mt="md"
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />
  );
}


export type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
};

export const PasswordField = ({
  label,
  value,
  onChange,
  required,
  error,
}: PasswordFieldProps) => {
  const [focused, setFocused] = useState(false);
  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <PasswordInput
      label={label}
      required={required}
      classNames={classes}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      error={error}
      mt="md"
      autoComplete="current-password"
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />
  );
}