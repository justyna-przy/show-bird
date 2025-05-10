// pages/_app.js
import * as React from "react";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import MyGlobalStyles from "@/styles/GlobalStyles";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/hooks/useWallet";

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
          href="https://fonts.googleapis.com/css2?family=Cactus+Classical+Serif&family=Koh+Santepheap:wght@100;300;400;700;900&family=Ledger&family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <WalletProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />

          {/* flex-grow so it fills the rest of the viewport */}
          <main style={{ flexGrow: 1, display: "flex" }}>
            <Component {...pageProps} />
          </main>
        </div>
      </WalletProvider>
    </ThemeProvider>
  );
}
