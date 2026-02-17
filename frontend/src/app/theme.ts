// theme.ts
import { createTheme } from "@mui/material/styles";

const baseTheme = createTheme({
  palette: {
    primary: {
      // Base estructural (sidebar, topbar, textos fuertes)
      main: "#1A1A1A",
      contrastText: "#ffffff",
    },
    secondary: {
      // Marca / CTA principal
      main: "#FAC418",
      contrastText: "#1A1A1A", // Mejor contraste real sobre amarillo
    },
    success: {
      main: "#22C55E",
      contrastText: "#ffffff",
    },
    error: {
      main: "#EF4444",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F59E0B",
      contrastText: "#1F2937",
    },
    info: {
      main: "#2563EB",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F7F8F9",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#6B7280",
    },
    divider: "rgba(17, 24, 39, 0.10)",
  },

  typography: {
    fontFamily: ['Mulish', 'Helvetica', 'Arial', 'sans-serif'].join(","),
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: 0,
    },
  },

  shape: {
    borderRadius: 12,
  },
});

export const theme = createTheme(baseTheme, {
  components: {
    // -----------------------------
    // BOTONES
    // -----------------------------
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 16,
          minHeight: 44,
        },
        // CTA principal (amarillo) => usar color="secondary"
        containedSecondary: {
          color: baseTheme.palette.secondary.contrastText,
          backgroundColor: baseTheme.palette.secondary.main,
          "&:hover": {
            // Un poco más oscuro, sin “neones”
            backgroundColor: "#E7B611",
          },
        },
        // Botón neutral/estructural (oscuro) => usar color="primary"
        containedPrimary: {
          color: baseTheme.palette.primary.contrastText,
          backgroundColor: baseTheme.palette.primary.main,
          "&:hover": {
            backgroundColor: "#111111",
          },
        },
        // Destructivo
        containedError: {
          "&:hover": {
            backgroundColor: "#DC2626",
          },
        },
        // Importante: no incentivar "containedSuccess" como CTA habitual
        containedSuccess: {
          "&:hover": {
            backgroundColor: "#16A34A",
          },
        },

        outlinedPrimary: {
          borderColor: "rgba(26, 26, 26, 0.25)",
          color: baseTheme.palette.primary.main,
          "&:hover": {
            borderColor: "rgba(26, 26, 26, 0.45)",
            backgroundColor: "rgba(26, 26, 26, 0.04)",
          },
        },
        outlinedSecondary: {
          borderColor: "rgba(250, 196, 24, 0.55)",
          color: baseTheme.palette.primary.main,
          "&:hover": {
            borderColor: "rgba(250, 196, 24, 0.85)",
            backgroundColor: "rgba(250, 196, 24, 0.10)",
          },
        },
        textPrimary: {
          "&:hover": {
            backgroundColor: "rgba(26, 26, 26, 0.04)",
          },
        },
        textSecondary: {
          "&:hover": {
            backgroundColor: "rgba(250, 196, 24, 0.12)",
          },
        },
      },
    },

    // -----------------------------
    // ALERTS (estética SaaS: outlined por defecto)
    // -----------------------------
    MuiAlert: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          alignItems: "center",
        },
        message: {
          fontWeight: 600,
        },

        // Success
        outlinedSuccess: {
          borderColor: "rgba(34, 197, 94, 0.35)",
          backgroundColor: "rgba(34, 197, 94, 0.08)",
          color: baseTheme.palette.text.primary,
        },
        // Error
        outlinedError: {
          borderColor: "rgba(239, 68, 68, 0.35)",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          color: baseTheme.palette.text.primary,
        },
        // Warning
        outlinedWarning: {
          borderColor: "rgba(245, 158, 11, 0.35)",
          backgroundColor: "rgba(245, 158, 11, 0.10)",
          color: baseTheme.palette.text.primary,
        },
        // Info
        outlinedInfo: {
          borderColor: "rgba(37, 99, 235, 0.30)",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          color: baseTheme.palette.text.primary,
        },
      },
    },

    // -----------------------------
    // LINKS
    // -----------------------------
    MuiLink: {
      defaultProps: {
        underline: "hover",
      },
      styleOverrides: {
        root: {
          color: baseTheme.palette.secondary.main,
          fontWeight: 700,
          textUnderlineOffset: "3px",
          textDecorationColor: "rgba(250, 196, 24, 0.65)",
          "&:hover": {
            textDecorationColor: "rgba(250, 196, 24, 1)",
          },
        },
      },
    },

    // -----------------------------
    // PAPER / CARDS
    // -----------------------------
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(17, 24, 39, 0.08)",
        },
      },
    },

    // -----------------------------
    // INPUTS (look & feel profesional)
    // -----------------------------
    MuiTextField: {
      defaultProps: {
        size: "medium",
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: baseTheme.palette.background.paper,
        },
        notchedOutline: {
          borderColor: "rgba(17, 24, 39, 0.14)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(17, 24, 39, 0.22)",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: baseTheme.palette.secondary.main, // foco con marca, elegante
          borderWidth: 2,
        },
      },
    },

    // -----------------------------
    // TOOLTIP (info real)
    // -----------------------------
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
  },
});
