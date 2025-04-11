// pages/_app.js
import * as React from "react";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import MyGlobalStyles from "@/styles/GlobalStyles";
import Navbar from "@/components/Navbar";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MyGlobalStyles />
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Jua&family=Quicksand:wght@300..700&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Navbar/>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
