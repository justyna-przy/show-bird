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

const OWNER_ADDRESS = "0x6dac08d6de80289e311821f77f6fe859fff85605";
const TOKEN_ADDR = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;

const Ctx = createContext(null);

export function WalletProvider({ children }) {
  /* -------------------------------------------------- wallet state */
  const [address, setAddress] = useState(null);
  const [loadingRoles, setLoading] = useState(true);
  const [isVenue, setVenue] = useState(false);
  const [isDoorman, setDoor] = useState(false);
  const [isAttendee, setAttend] = useState(false);

  /* -------------------------------------------------- connect / disconnect */
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }
    const [acct] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(acct);
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);
  const load = useCallback((addr) => setAddress(addr), []);

  /* -------------------------------------------------- provider / signer */
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      setProvider(new ethers.JsonRpcProvider(RPC_URL));
    }
  }, []);

  /* -------------------------------------------------- signer */
  const signer = useMemo(() => {
    if (!provider || !address) return null;
    // BrowserProvider.getSigner() automatically picks the active account
    return provider.getSigner();
  }, [provider, address]);

  /* -------------------------------------------------- contract (read if no signer) */
  const contract = useMemo(() => {
    if (!provider || !TOKEN_ADDR) return null;
    return new ethers.Contract(TOKEN_ADDR, TicketAbi.abi, signer || provider);
  }, [provider, signer]);

  /* -------------------------------------------------- role discovery */
  useEffect(() => {
    let alive = true;

    async function loadRoles() {
      if (!address) {
        alive &&
          (setVenue(false),
          setDoor(false),
          setAttend(false),
          setLoading(false));
        return;
      }

      // venue == owner
      if (address.toLowerCase() === OWNER_ADDRESS.toLowerCase()) {
        alive &&
          (setVenue(true), setDoor(false), setAttend(false), setLoading(false));
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
        setAttend(true); // graceful fallback
      } finally {
        alive && setLoading(false);
      }
    }

    setLoading(true);
    loadRoles();
    return () => {
      alive = false;
    };
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
    load,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useWallet = () => useContext(Ctx);
