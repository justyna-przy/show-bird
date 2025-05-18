"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  TextField,
  Button,
} from "@mui/material";
import { ethers } from "ethers";
import { useTheme } from "@mui/material/styles";
import { useWallet } from "@/hooks/useWallet";
import { useTicketToken } from "@/hooks/useTicketToken";
import { useTicketSale } from "@/hooks/useTicketSale";

export default function Balance() {
  const theme = useTheme();

  const { address, provider } = useWallet();
  const { tokenRead } = useTicketToken();

  const [eth, setEth] = useState(null);
  const [tickets, setTickets] = useState(null);
  const { priceWei, refundPct, refundTickets } = useTicketSale();
  const [refundQty, setRefundQty] = useState(1);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });
  const notify = (m, s = "success") => setToast({ open: true, msg: m, sev: s });

  // useEffect is called when the component mounts or when address, provider, or tokenRead changes
  useEffect(() => {
    if (!address || !provider || !tokenRead) return;

    let stale = false;
    (async () => {
      try {
        const [rawEth, tk] = await Promise.all([
          provider.getBalance(address),
          tokenRead.balanceOf(address),
        ]);
        if (!stale) {
          setEth(ethers.formatEther(rawEth));
          setTickets(Number(tk));
        }
      } catch (e) {
        console.warn("Balance fetch failed:", e);
      }
    })();

    return () => {
      stale = true;
    };
  }, [address, provider, tokenRead]);

  return (
    <>
      <Card
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          border: `2px solid ${theme.palette.primary.light}`,
        }}
      >
        {/* Left side: crypto balance and tickets */}
        <Box
          display="flex"
          flexDirection="column"
          gap={1}
          sx={{ bgcolor: theme.palette.background.default, p: 3 }}
        >
          <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
            >
              Crypto Balance
            </Typography>
          <Typography variant="h5" fontWeight={700}>
            {eth !== null ? `${Number(eth).toFixed(5)} ETH` : "…"}
          </Typography>
          <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
            >
              My Tickets
            </Typography>
          <Typography variant="h5" fontWeight={700}>
            {tickets !== null ? tickets : "…"}
          </Typography>
        </Box>
        <Card
            sx={{
              minWidth: 260,
              borderRadius: 3,
              boxShadow: 4,
              bgcolor: theme.palette.background.paper,
              border: `2px dashed ${theme.palette.primary.main}`,
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Refund Tickets ({refundPct}% back)
              </Typography>

              <TextField
                label="Quantity"
                type="number"
                size="small"
                value={refundQty}
                onChange={(e) =>
                  setRefundQty(Math.max(1, Number(e.target.value)))
                }
                inputProps={{ min: 1, max: tickets ?? 1 }}
              />

              {/* calculated refund */}
              <Typography variant="body2">
                You’ll receive&nbsp;
                {ethers.formatEther(
                  (priceWei * BigInt(refundQty) * BigInt(refundPct)) / 100n
                )}{" "}
                SETH
              </Typography>

              <Button
                variant="contained"
                disabled={!tickets || refundQty > tickets}
                onClick={async () => {
                  try {
                    await refundTickets(refundQty);
                    notify("Refund successful");
                  } catch (e) {
                    console.error(e);
                    notify("Refund failed", "error");
                  }
                }}
              >
                Refund
              </Button>
            </CardContent>
          </Card>
        
      </Card>

      <Box display="flex" gap={3} flexWrap="wrap" sx={{ mt: 2 }}>
        {/* ETH card */}
        <Card
          sx={{
            minWidth: 200,
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.light}`,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
            >
              Crypto Balance
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {eth !== null ? `${eth} ETH` : "…"}
            </Typography>
          </CardContent>
        </Card>

        {/* Ticket card */}
        <Card
          sx={{
            minWidth: 200,
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              My Tickets
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {tickets !== null ? tickets : "…"}
            </Typography>
          </CardContent>
        </Card>

        {priceWei && refundPct !== null && (
          <Card
            sx={{
              minWidth: 260,
              borderRadius: 3,
              boxShadow: 4,
              bgcolor: theme.palette.background.paper,
              border: `2px dashed ${theme.palette.primary.main}`,
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Refund Tickets ({refundPct}% back)
              </Typography>

              <TextField
                label="Quantity"
                type="number"
                size="small"
                value={refundQty}
                onChange={(e) =>
                  setRefundQty(Math.max(1, Number(e.target.value)))
                }
                inputProps={{ min: 1, max: tickets ?? 1 }}
              />

              {/* calculated refund */}
              <Typography variant="body2">
                You’ll receive&nbsp;
                {ethers.formatEther(
                  (priceWei * BigInt(refundQty) * BigInt(refundPct)) / 100n
                )}{" "}
                SETH
              </Typography>

              <Button
                variant="contained"
                disabled={!tickets || refundQty > tickets}
                onClick={async () => {
                  try {
                    await refundTickets(refundQty);
                    notify("Refund successful");
                  } catch (e) {
                    console.error(e);
                    notify("Refund failed", "error");
                  }
                }}
              >
                Refund
              </Button>
            </CardContent>
          </Card>
        )}
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
