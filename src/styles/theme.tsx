import { createTheme } from '@mantine/core';

export const theme = createTheme({
  white: '#ffffff',
  black: '#171717',

  colors: {
    // Amarillo corporativo. El tono 6 es exactamente #fac418
    brand: [
      '#fff9df',
      '#fff1b2',
      '#ffe780',
      '#ffdc4d',
      '#ffd22a',
      '#fecb1e',
      '#fac418',
      '#dda700',
      '#b58700',
      '#8a6600',
    ],

    // Gris corporativo. El tono 7 es exactamente #343434
    charcoal: [
      '#f5f5f5',
      '#e7e7e7',
      '#cdcdcd',
      '#b2b2b2',
      '#888888',
      '#666666',
      '#4d4d4d',
      '#343434',
      '#252525',
      '#171717',
    ],

    danger: [
      '#fff1f1',
      '#ffe0e0',
      '#ffc7c7',
      '#ffa8a8',
      '#ff8787',
      '#ff6b6b',
      '#fa5252',
      '#e03131',
      '#c92a2a',
      '#a51111',
    ],

    warning: [
      '#fff8e1',
      '#ffedb2',
      '#ffdf80',
      '#ffd04d',
      '#ffc126',
      '#f7ad0b',
      '#e89a00',
      '#c97d00',
      '#a56500',
      '#7f4d00',
    ],

    success: [
      '#ecfdf5',
      '#d1fae5',
      '#a7f3d0',
      '#6ee7b7',
      '#34d399',
      '#10b981',
      '#059669',
      '#047857',
      '#065f46',
      '#064e3b',
    ],

    info: [
      '#eff6ff',
      '#dbeafe',
      '#bfdbfe',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb',
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
    ],
  },

  primaryColor: 'brand',
  primaryShade: 6,
  autoContrast: true,
  defaultRadius: 'md',
});