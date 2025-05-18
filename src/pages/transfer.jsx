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
import { useTicketSale } from "@/hooks/useTicketSale";
import { useTheme } from "@mui/material/styles";

export default function TransferPage() {
  /* ─── helpers ─────────────────────────────────────────── */
  const { address, isConnected, getSigner } = useWallet();
  const { tokenRead } = useTicketToken();
  const { selfRedeem } = useTicketSale();

  /* ─── local state ─────────────────────────────────────── */
  const [ownerAddr, setOwnerAddr] = useState(null);
  const [myTickets, setMyTickets] = useState(null);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });
  const notify = (m, s = "success") => setToast({ open: true, msg: m, sev: s });
  const theme = useTheme();

  /* ─── fetch venue owner + my balance ───────────────────── */
  useEffect(() => {
    if (!address || !tokenRead) return;

    let stale = false;
    (async () => {
      try {
        const [owner, bal] = await Promise.all([
          tokenRead.owner(), // venue address
          tokenRead.balanceOf(address), // BigInt
        ]);
        if (!stale) {
          setOwnerAddr(owner);
          setMyTickets(Number(bal)); // safe cast (0-decimals)
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
      await selfRedeem(qty);
      notify(`Redeemed ${qty} ticket${qty>1?"s":""}`);
      setMyTickets(prev => prev - qty);
      setQty(1);
    } catch (e) {
      console.error(e);
      notify("Redeem failed", "error");
    }
  };

  /* ─── guards ──────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <Box p={4}>
        <Typography variant="h6">
          Connect your wallet to transfer tickets.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap="2rem"
        margin={"auto"}
        paddingBottom={4}
      >
        <Typography variant="h4">Transfer Tickets back to Venue</Typography>

        <Card
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            padding: 3,
            border: `2px solid ${theme.palette.primary.light}`,
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6" fontWeight={500}>
                Venue address:&nbsp;
                {ownerAddr
                  ? `${ownerAddr.slice(0, 6)}…${ownerAddr.slice(-4)}`
                  : "…"}
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                Your tickets:&nbsp;{myTickets ?? "…"}
              </Typography>
            </Box>

            <TextField
              label="Quantity"
              type="number"
              size="medium"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1, max: myTickets ?? 1 }}
            />

            <Button
              variant="contained"
            size="large"
              disabled={!myTickets || qty > myTickets || !ownerAddr}
              onClick={handleTransfer}
            >
              Transfer to Venue
            </Button>
          </CardContent>
        </Card>
      </Box>

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
