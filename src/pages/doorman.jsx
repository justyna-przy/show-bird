// pages/doorman.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";

import { useWallet } from "@/hooks/useWallet";
import { useTicketSale } from "@/hooks/useTicketSale";
import { useTicketToken } from "@/hooks/useTicketToken";
import { useTheme } from "@mui/material/styles";
import { useToast } from "@/components/ToastContext";

export default function DoormanPage() {
  /* ------------------------------------------------------------------ */
  /*  Wallet + contracts                                                */
  /* ------------------------------------------------------------------ */
  const { isConnected, getSigner } = useWallet();
  const { saleRead, redeemTickets, priceWei } = useTicketSale(); // saleRead may be null
  const { tokenRead } = useTicketToken(); // tokenRead may be null
  const toast = useToast();

  /* ------------------------------------------------------------------ */
  /*  Local state                                                       */
  /* ------------------------------------------------------------------ */
  const [addr, setAddr] = useState("");
  const [redeemable, setRed] = useState(null);
  const [qty, setQty] = useState(1);
  const theme = useTheme();

  /* ------------------------------------------------------------------ */
  /*  Pull redeemable count                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!ethers.isAddress(addr) || !tokenRead) {
      setRed(null);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const raw = await tokenRead.balanceOf(addr);
        if (!ignore) setRed(Number(raw));
      } catch {
        if (!ignore) setRed(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [addr, tokenRead]);

  /* ------------------------------------------------------------------ */
  /*  Redeem                                                            */
  /* ------------------------------------------------------------------ */
  const doRedeem = async () => {
    try {
      if (!saleRead) {
        toast.error("Sale contract not found");
        return;
      }

      const signer = await getSigner();
      await saleRead.connect(signer).redeemTickets.staticCall(addr, qty);

      await redeemTickets(addr, qty);
      toast.success(`Redeemed ${qty} ticket${qty > 1 ? "s" : ""}`);

      const raw = await tokenRead.balanceOf(addr);
      setRed(Number(raw));
      setQty(1);
      toast.success("Redeem successful");
    } catch (e) {
      console.error(e);
      toast.error("Redeem failed");
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Guards                                                            */
  /* ------------------------------------------------------------------ */
  if (!isConnected) {
    return (
      <Box p={4}>
        <Typography variant="h6">
          Connect your doorman wallet to continue.
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
      >
        <Typography variant="h4">Doorman - Redeem Ticket</Typography>

        <Card
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            border: `2px solid ${theme.palette.primary.light}`,
            overflow: "hidden",
            alignItems: "center",
            width: "480px",
          }}
        >
          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="subtitle1">Attendee wallet</Typography>
            <TextField
              label="0x… address"
              fullWidth
              value={addr}
              onChange={(e) => setAddr(e.target.value.trim())}
            />

            <Divider sx={{ my: 1 }} />

            <Typography>
              Redeemable tickets:&nbsp;{redeemable ?? "0"}
            </Typography>

            <TextField
              label="Redeem quantity"
              type="number"
              size="small"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              inputProps={{ min: 1, max: redeemable ?? 1 }}
            />

            {priceWei && (
              <Typography variant="body2">
                Unlocks&nbsp;
                {ethers.formatEther(priceWei * BigInt(qty))}&nbsp;SETH
                for the venue
              </Typography>
            )}

            <Button
              variant="contained"
              disabled={
                !saleRead ||
                !ethers.isAddress(addr) ||
                redeemable === null ||
                qty < 1 ||
                qty > redeemable
              }
              onClick={doRedeem}
            >
              Redeem
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

DoormanPage.roles = ["Doorman"];
