import React from "react";
import { GlobalStyles } from "@mui/material";

const MyGlobalStyles = () => (
  <GlobalStyles
    styles={(theme) => ({
      // Import the Google Font if needed (example remains here)
      "@import":
        'url("https://fonts.googleapis.com/css2?family=Sour+Gummy:wght@400;500;600;700&display=swap")',

      // Define the thin variant of Roca Two
      "@font-face": [
        {
          fontFamily: "Roca Two",
          src: `url('/fonts/Roca_Two_Thin.ttf') format('truetype')`,
          fontWeight: 300,
          fontStyle: "normal",
          fontDisplay: "swap",
        },
        {
          fontFamily: "Roca Two",
          src: `url('/fonts/Roca_Two_Bold.ttf') format('truetype')`,
          fontWeight: 700,
          fontStyle: "normal",
          fontDisplay: "swap",
        },
      ],

      // Apply some global styles
      body: {
        margin: 0,
        padding: 0,
        backgroundColor: "#e2e2e2" ,
        color: theme.palette.text.primary,

      },

      "*": {
        boxSizing: "border-box",
        margin: 0,
        padding: 0,
      },

      a: {
        textDecoration: "none",
      },
    })}
  />
);

export default MyGlobalStyles;
