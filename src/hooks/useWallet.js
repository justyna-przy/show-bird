import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import TicketAbi from "@/abi/TicketToken.json";

const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_VENUE_ADDRESS?.toLowerCase();
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;
const WalletCtx = createContext(null);

/**
 * <WalletProvider> wraps _app and provides a wallet connection context.
 */
export function WalletProvider({ children }) {
  // State
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [role, setRole] = useState("Attendee");
  const [loadingRole, setLoadingRole] = useState(true);

  // Setup provider
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      setProvider(new ethers.JsonRpcProvider(RPC_URL));
    }
  }, []);

  const load = useCallback((addr) => setAddress(addr), []);
  const connect = useCallback(async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    const [acct] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAddress(acct);
  }, []);
  const disconnect = useCallback(() => setAddress(null), []);

  // Called by sub-hooks to get AB
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
    provider,
    address,
    isConnected: !!address,
    connect,
    disconnect,
    role,
    loadingRole,
    isVenue: role === "Venue",
    isDoorman: role === "Doorman",
    isAttendee: role === "Attendee",
    load,
    getSigner,
  };

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}

export const useWallet = () => {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be inside <WalletProvider>");
  return ctx;
};
