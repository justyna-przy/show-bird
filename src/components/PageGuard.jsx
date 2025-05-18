"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";

/**
 * Blocks rendering until the user is connected
 * **and** their role is in `allowed`.
 *
 * @param {string[]} allowed – e.g. ["Attendee"] or ["Venue", "Doorman"]
 */
/* ...imports ... */

function GuardedLayout({ Component, pageProps }) {
  const { isConnected, role, loadingRole } = useWallet();

  const allowed = Component.roles; // undefined = public

  const showPage =
    !allowed || // public
    (!loadingRole && isConnected && allowed.includes(role));

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar /> {/* ➊ navbar always visible */}
      <main style={{ flexGrow: 1, display: "flex" }}>
        {showPage ? (
          <Component {...pageProps} />
        ) : loadingRole ? null : (
          <Forbidden />
        )}
      </main>
    </div>
  );
}
