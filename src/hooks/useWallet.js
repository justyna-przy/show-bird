"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ethers } from "ethers";
import TicketAbi from "@/abi/TicketToken.json";

const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_VENUE_ADDRESS?.toLowerCase();
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;

const WalletCtx = createContext(null);

/**
 * <AuthWalletProvider> wraps _once_ high up (e.g. in _app.js)
 * and provides connection / role / getSigner helpers.
 */
export function WalletProvider({ children }) {
  // ---------- provider ----------
  const [provider, setProvider] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      setProvider(new ethers.JsonRpcProvider(RPC_URL));
    }
  }, []);

  // ---------- wallet address ----------
  const [address, setAddress] = useState(null);
  const connect = useCallback(async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const [acct] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(acct);
  }, []);
  const disconnect = useCallback(() => setAddress(null), []);

  // ---------- role ----------
  const [role, setRole] = useState("Attendee"); // default
  const [loadingRole, setLoadingRole] = useState(true);

  /** Called by sub-hooks that know Token ABI so we don’t couple here */
  useEffect(() => {
    if (!address || !provider) {
      setRole("Attendee");
      setLoadingRole(false);
      return;
    }

    let ignore = false;
    (async () => {
      try {
        if (address.toLowerCase() === OWNER_ADDRESS) {
          setRole("Venue");
        } else {
          const token = new ethers.Contract(
            TOKEN_ADDRESS,
            TicketAbi.abi,
            provider
          );
          const r = await token.roleOf(address);
          if (!ignore) setRole(r);
        }
      } catch (e) {
        console.error("role fetch failed:", e);
        if (!ignore) setRole("Attendee");
      } finally {
        if (!ignore) setLoadingRole(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [address, provider]);

  // ---------- signer helper ----------
  const getSigner = useCallback(async () => {
    let prov = provider;
    if (!prov) {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No injected provider");
      }
      prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov); // cache
    }
    await prov.send("eth_requestAccounts", []);
    return prov.getSigner();
  }, [provider]);

  const value = {
    // connection
    provider,
    address,
    isConnected: !!address,
    connect,
    disconnect,

    // role
    role,
    loadingRole,
    isVenue: role === "Venue",
    isDoorman: role === "Doorman",
    isAttendee: role === "Attendee",

    // signer factory
    getSigner,
  };

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}

export const useWallet = () => {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be inside <WalletProvider>");
  return ctx;
};
