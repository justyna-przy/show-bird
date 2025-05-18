// pages/transfer.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";

import { useWallet } from "@/hooks/useWallet";
import { useTicketToken } from "@/hooks/useTicketToken";

export default function TransferPage() {
  /* ─── helpers ─────────────────────────────────────────── */
  const { address, isConnected, getSigner } = useWallet();
  const { tokenRead } = useTicketToken();

  /* ─── local state ─────────────────────────────────────── */
  const [ownerAddr, setOwnerAddr] = useState(null);
  const [myTickets, setMyTickets] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });
  const notify = (m, s = "success") => setToast({ open: true, msg: m, sev: s });

  /* ─── fetch venue owner + my balance ───────────────────── */
  useEffect(() => {
    if (!address || !tokenRead) return;

    let stale = false;
    (async () => {
      try {
        const [owner, bal] = await Promise.all([
          tokenRead.owner(),               // venue address
          tokenRead.balanceOf(address),    // BigInt
        ]);
        if (!stale) {
          setOwnerAddr(owner);
          setMyTickets(Number(bal));       // safe cast (0-decimals)
        }
      } catch (e) {
        console.warn(e);
      }
    })();

    return () => {
      stale = true;
    };
  }, [address, tokenRead]);

  /* ─── transfer handler ────────────────────────────────── */
  const handleTransfer = async () => {
    try {
      const signer   = await getSigner();
      const contract = tokenRead.connect(signer);

      // ERC-20 transfer back to venue owner
      const tx = await contract.transfer(ownerAddr, qty);
      await tx.wait();

      notify(`Transferred ${qty} ticket${qty > 1 ? "s" : ""} to the venue`);
      setMyTickets((prev) => prev - qty);
      setQty(1);
    } catch (e) {
      console.error(e);
      notify("Transfer failed", "error");
    }
  };

  /* ─── guards ──────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <Box p={4}>
        <Typography variant="h6">Connect your wallet to transfer tickets.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Transfer / Redeem Tickets
        </Typography>

        <Card sx={{ maxWidth: 420, mt: 2, boxShadow: 4 }}>
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography>
              Venue address:&nbsp;
              {ownerAddr
                ? `${ownerAddr.slice(0, 6)}…${ownerAddr.slice(-4)}`
                : "…"}
            </Typography>

            <Typography>
              Your tickets:&nbsp;{myTickets ?? "…"}
            </Typography>

            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1, max: myTickets ?? 1 }}
            />

            <Button
              variant="contained"
              disabled={!myTickets || qty > myTickets || !ownerAddr}
              onClick={handleTransfer}
            >
              Transfer to Venue
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
TransferPage.roles = ["Attendee", "Doorman", "Venue"];