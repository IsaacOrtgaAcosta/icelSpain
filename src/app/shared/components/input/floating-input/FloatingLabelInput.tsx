import { useState } from 'react';
import { TextInput } from '@mantine/core';
import classes from './FloatingLabelInput.module.css';

export type FloatingLabelInputProps = {
  label: string;
  required?: boolean;
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ label, required }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <TextInput
      label={label}
      required={required}
      classNames={classes}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      mt="md"
      autoComplete="nope"
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />
  );
}

import { PasswordInput } from '@mantine/core';

export type PasswordFieldProps = {
  label: string;
  required?: boolean;
};

export function PasswordField({
  label,
  required,
}: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');

  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <PasswordInput
      label={label}
      required={required}
      classNames={classes}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      mt="md"
      autoComplete="current-password"
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
    />
  );
}