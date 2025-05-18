"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import SaleAbi from "@/abi/TicketSale.json";

const SALE_ADDRESS = process.env.NEXT_PUBLIC_TICKET_SALE_ADDRESS;

/**
 * Provides price, totalSold, contractBalance, plus buy/setPrice/withdraw.
 */
export function useTicketSale() {
  const { provider, getSigner, isVenue } = useWallet();

  // ----- read-only contract -----
  const saleRead = useMemo(() => {
    if (!provider || !SALE_ADDRESS) return null;
    return new ethers.Contract(SALE_ADDRESS, SaleAbi.abi, provider);
  }, [provider]);

  // ----- live stats -----
  const [priceWei, setPriceWei] = useState(null);
  const [totalSold, setTotalSold] = useState(null);
  const [contractBalance, setContractBalance] = useState(null);
  const [refundPct, setRefundPct] = useState(null);

  useEffect(() => {
    if (!saleRead || !provider) return;
    let stale = false;
    const pull = async () => {
      try {
        const [p, ts, bal, rp] = await Promise.all([
          saleRead.priceWei(),
          saleRead.totalSold(),
          provider.getBalance(SALE_ADDRESS),
          saleRead.refundPercentage(),
        ]);
        if (!stale) {
          setPriceWei(p);
          setTotalSold(ts);
          setContractBalance(bal);
          setRefundPct(Number(rp));
        }
      } catch (e) {
        console.warn("sale stats failed:", e);
      }
    };
    pull();
    const iv = setInterval(pull, 30_000);
    return () => {
      stale = true;
      clearInterval(iv);
    };
  }, [saleRead, provider]);

  // ----- write helpers -----
  const buyTickets = useCallback(
    async (qty, priceWeiEach) => {
      const signer = await getSigner();
      const contract = saleRead.connect(signer);
      const total = priceWeiEach * BigInt(qty);
      const tx = await contract.buyTickets(qty, { value: total });
      await tx.wait();
    },
    [getSigner, saleRead]
  );

  const setPrice = useCallback(
    async (newPriceWei) => {
      if (!isVenue) throw new Error("Only venue can set price");
      const signer = await getSigner();
      const contract = saleRead.connect(signer);
      const tx = await contract.updatePrice(newPriceWei);
      await tx.wait();
      setPriceWei(newPriceWei);
    },
    [isVenue, getSigner, saleRead]
  );

  const withdrawFunds = useCallback(
    async (to) => {
      if (!isVenue) throw new Error("Only venue can withdraw");
      const signer = await getSigner();
      const contract = saleRead.connect(signer);
      const tx = await contract.withdrawFunds(to);
      await tx.wait();
    },
    [isVenue, getSigner, saleRead]
  );

  const getRecentPurchases = useCallback(
    async (limit = 10) => {
      if (!saleRead || !provider) return [];
      const evts = await saleRead.queryFilter(
        saleRead.filters.TicketsPurchased(),
        -50_000
      );
      evts.sort((a, b) => b.blockNumber - a.blockNumber);
      return Promise.all(
        evts.slice(0, limit).map(async (e) => {
          const { buyer, qty } = e.args; // qty is a BigInt
          const blk = await provider.getBlock(e.blockNumber);
          return {
            buyer,
            qty: Number(qty), // ← convert safely
            timestamp: new Date(blk.timestamp * 1000),
          };
        })
      );
    },
    [saleRead, provider]
  );

  const refundTickets = useCallback(
    async (qty) => {
      const signer = await getSigner();
      const contract = saleRead.connect(signer);
      const tx = await contract.refundTickets(qty);
      await tx.wait();
    },
    [getSigner, saleRead]
  );

  const redeemTickets = useCallback(
    async (attendeeAddr, qty) => {
      const signer = await getSigner();
      const contract = saleRead.connect(signer);
      const tx = await contract.redeemTickets(attendeeAddr, qty);
      await tx.wait();
    },
    [getSigner, saleRead]
  );

  return {
    saleRead,
    priceWei,
    totalSold,
    contractBalance,
    refundPct,

    buyTickets,
    setPrice,
    withdrawFunds,
    refundTickets,
    getRecentPurchases,
    redeemTickets,
  };
}
