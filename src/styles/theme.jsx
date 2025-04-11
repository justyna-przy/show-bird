import { createTheme} from '@mui/material/styles';
import { fonts } from './fonts';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: "#d1d5de",
      paper: "#b2b9c1",
    },
    text: {
      primary: "#18171c",
      secondary: "#3c3d45",
    },
    primary: {
      main: "#02887d", 
    },
    secondary: {
      main: "#ff4081", 
    },
  },
  typography: {
    fontFamily: "'Quicksand', sans-serif",
    h1: {
      fontFamily: "'Sour Gummy', sans-serif",
      fontWeight: 500,
      fontSize: "3rem",
    },
    h2: {
      fontWeight: 500,
      fontSize: "2.5rem",
    },
    body1: {
      fontSize: "1rem",
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
});

export default theme;
