import { useMemo } from "react";
import { ethers } from "ethers";
import TokenDef from "@/abi/TicketToken.json";

export default function useContract() {
  return useMemo(() => {
    // provider: injected or fallback
    const provider =
      typeof window !== "undefined" && window.ethereum
        ? new ethers.BrowserProvider(window.ethereum)
        : new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_SEPOLIA_RPC
          );
    const signer = provider.getSigner();
    const addr = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;
    if (!addr) {
      throw new Error("Missing TICKET_TOKEN_ADDRESS env var");
    }
    return new ethers.Contract(addr, TokenDef.abi, signer);
  }, []);
}
