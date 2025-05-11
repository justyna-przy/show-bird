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

const OWNER_ADDRESS = "0xYourDeployerAddressHere";          // 👈 change me
const TOKEN_ADDR    = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;
const RPC_URL       = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

const Ctx = createContext(null);

export function WalletProvider({ children }) {
  /* -------------------------------------------------- wallet state */
  const [address, setAddress]       = useState(null);
  const [loadingRoles, setLoading]  = useState(true);
  const [isVenue,   setVenue]       = useState(false);
  const [isDoorman, setDoor]        = useState(false);
  const [isAttendee,setAttend]      = useState(false);

  /* -------------------------------------------------- connect / disconnect */
  const connect = useCallback(async () => {
    if (!window.ethereum) { alert("Install MetaMask"); return; }
    const [acct] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(acct);
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  /* -------------------------------------------------- provider / signer */
  const provider = useMemo(() => (
    typeof window !== "undefined" && window.ethereum
      ? new ethers.BrowserProvider(window.ethereum)
      : new ethers.JsonRpcProvider(RPC_URL)
  ), []);

  // signer only after a wallet is connected (avoids SSR “no such account”)
  const signer = useMemo(() => (
    address && typeof window !== "undefined"
      ? provider.getSigner()
      : null
  ), [address, provider]);

  /* -------------------------------------------------- contract (read if no signer) */
  const contract = useMemo(() => {
    if (!TOKEN_ADDR) throw new Error("Missing NEXT_PUBLIC_TICKET_TOKEN_ADDRESS");
    return new ethers.Contract(TOKEN_ADDR, TicketAbi.abi, signer || provider);
  }, [signer, provider]);

  /* -------------------------------------------------- role discovery */
  useEffect(() => {
    let alive = true;

    async function loadRoles() {
      if (!address) {
        alive && (setVenue(false), setDoor(false), setAttend(false), setLoading(false));
        return;
      }

      // venue == owner
      if (address.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        alive && (setVenue(true), setDoor(false), setAttend(false), setLoading(false));
        return;
      }

      try {
        // call through read-only runner to avoid signer issues
        const roContract = contract.connect(provider);
        const door = await roContract.isDoorman(address);
        if (!alive) return;
        setVenue(false);
        setDoor(door);
        setAttend(!door);
      } catch (e) {
        console.warn("isDoorman() failed, defaulting to Attendee", e);
        if (!alive) return;
        setVenue(false);
        setDoor(false);
        setAttend(true);          // graceful fallback
      } finally {
        alive && setLoading(false);
      }
    }

    setLoading(true);
    loadRoles();
    return () => { alive = false; };
  }, [address, contract, provider]);

  /* -------------------------------------------------- expose everything */
  const value = {
    // wallet
    address,
    isConnected: !!address,
    connect,
    disconnect,
    // roles
    loadingRoles,
    isVenue,
    isDoorman,
    isAttendee,
    // ethers goodies
    provider,
    signer,
    contract,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useWallet = () => useContext(Ctx);
