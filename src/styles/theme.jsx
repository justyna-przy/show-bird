import { createTheme } from "@mui/material/styles";
import { fonts } from "./fonts";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#d1d5de",
      paper: "#fdf8f8",
    },
    text: {
      primary: "#292722",
      secondary: "#4c402b",
    },
    primary: {
      main: "#02887d",
      teal: "#02887d",
      purple: "#8d4395",
    },
    secondary: {
      main: "#ff4081",
    },
  },
  typography: {
    fontFamily: "'Cactus Classical Serif', serif",
    h1: {
      fontFamily: "'Roca Two', sans-serif",
      fontWeight: 700,
      fontSize: "3.5rem",
      background: "linear-gradient(to right, #02887d, #8d4395)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h2: {
      fontWeight: 700,
      fontSize: "1.8rem",
      color: (palette) => palette.text.secondary,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body2: {
      fontSize: "0.9rem",
      fontWeight: 500,
      color: "#2c2b27",
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: "1.1rem",
          textTransform: "none",
          borderRadius: "0.5rem",
          padding: "0.2rem 1rem",
          color: "#18171c",
          boxShadow: "none",
          border: "1px solid #02887d",
          "&:hover": {
            boxShadow: "none",
            border: "1px solid #8d4395",
          },
        },
        contained: {
          backgroundColor: "#02887d",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#8d4395",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#02887d",
            },
            "&:hover fieldset": {
              borderColor: "#8d4395",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8d4395",
            },
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: false,
        maxWidth: false,
      },
      styleOverrides: {
        paper: {
          width: "30rem",   
          maxWidth: "90vw", 
          margin: "1rem",    
        },
      },
    },
  },
});

export default theme;
