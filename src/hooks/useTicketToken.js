"use client";

import { useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import TokenAbi from "@/abi/TicketToken.json";

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TICKET_TOKEN_ADDRESS;

/**
 * Token-centric helpers: assignDoorman, redeemTickets (if you add it later).
 */
export function useTicketToken() {
  const {
    provider,
    getSigner,
    isVenue,
  } = useWallet();

  // read contract
  const tokenRead = useMemo(() => {
    if (!provider || !TOKEN_ADDRESS) return null;
    return new ethers.Contract(TOKEN_ADDRESS, TokenAbi.abi, provider);
  }, [provider]);


  // write helpers
  const assignDoorman = useCallback(
    async (walletAddr, enabled) => {
      if (!isVenue) throw new Error("Only venue can assign doorman");
      const signer   = await getSigner();
      const contract = tokenRead.connect(signer);
      const tx = await contract.setDoorman(walletAddr, enabled);
      await tx.wait();
    },
    [isVenue, tokenRead, getSigner]
  );

  // add redeemTickets, mintBatch, etc. here if needed

  return { tokenRead, assignDoorman };
}
