import * as React from "react";
import Head from "next/head";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import MyGlobalStyles from "@/styles/GlobalStyles";
import Navbar from "@/components/Navbar";
import { WalletProvider } from "@/hooks/useWallet";
import Forbidden from "@/pages/403";
import { ToastProvider } from "@/components/ToastContext";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/router";

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
        <ToastProvider>
          <GuardedLayout Component={Component} pageProps={pageProps} />
        </ToastProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

// This component is responsible for guarding restricted pages
// and redirecting users to the appropriate page based on their authentication status.
function GuardedLayout({ Component, pageProps }) {
  const { isConnected, role, loadingRole } = useWallet();
  const router = useRouter();
  const allowed = Component.roles;

  // Redirects to the tickets page if the user is not authenticated
  React.useEffect(() => {
    if (loadingRole) return;

    if (allowed && (!isConnected || !allowed.includes(role))) {
      router.replace("/tickets");
    }
  }, [allowed, isConnected, role, loadingRole, router]);

  if (allowed && (!isConnected || !allowed.includes(role))) {
    return loadingRole ? null : <Forbidden />;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <main style={{ flexGrow: 1, display: "flex" }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
