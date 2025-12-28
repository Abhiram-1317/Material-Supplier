import {createTheme} from "@mui/material/styles";

export const customerTheme = createTheme({
  palette: {
    primary: {main: "#1A73E8"},
    secondary: {main: "#FFB020"},
    background: {
      default: "#F3F4F6",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
    },
    success: {main: "#10B981"},
    error: {main: "#DC2626"},
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});
