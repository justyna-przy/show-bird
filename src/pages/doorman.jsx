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

import { useWallet }      from "@/hooks/useWallet";
import { useTicketSale }  from "@/hooks/useTicketSale";
import { useTicketToken } from "@/hooks/useTicketToken";

export default function DoormanPage() {
  /* ------------------------------------------------------------------ */
  /*  Wallet + contracts                                                */
  /* ------------------------------------------------------------------ */
  const { isConnected } = useWallet();
  const { saleRead, redeemTickets, priceWei } = useTicketSale();   // saleRead may be null
  const { tokenRead } = useTicketToken(); // tokenRead may be null

  /* ------------------------------------------------------------------ */
  /*  Local state                                                       */
  /* ------------------------------------------------------------------ */
  const [addr, setAddr]       = useState("");
  const [redeemable, setRed]  = useState(null);
  const [qty, setQty]         = useState(1);
  const [toast, setToast]     = useState({ open:false, msg:"", sev:"info" });

  const notify = (msg, sev="success") => setToast({ open:true, msg, sev });

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
    return () => { ignore = true; };
  }, [addr, tokenRead]);

  /* ------------------------------------------------------------------ */
  /*  Redeem                                                            */
  /* ------------------------------------------------------------------ */
  const doRedeem = async () => {
    try {
      if (!saleRead) {
        notify("Contract not ready yet", "error");
        return;
      }

      // dry-run first – gets revert reason
      await saleRead.callStatic.redeemTickets(addr, qty);

      await redeemTickets(addr, qty);
      notify(`Redeemed ${qty} ticket${qty>1?"s":""}`);

      const raw = await tokenRead.balanceOf(addr); 
      setRed(Number(raw));
      setQty(1);
      notify("Redeem successful", "success");
    } catch (e) {
      console.error(e);
      notify("Redeem failed", "error");
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
      <Box p={4}>
        <Typography variant="h4" gutterBottom>
          Doorman — Redeem Tickets
        </Typography>

        <Card sx={{ maxWidth:480, boxShadow:4 }}>
          <CardContent sx={{ display:"flex", flexDirection:"column", gap:2 }}>
            <Typography variant="subtitle1">Attendee wallet</Typography>
            <TextField
              label="0x… address"
              fullWidth
              value={addr}
              onChange={(e) => setAddr(e.target.value.trim())}
            />

            <Divider sx={{ my:1 }} />

            <Typography>
              Redeemable (purchased) tickets:&nbsp;{redeemable ?? "…"}
            </Typography>

            <TextField
              label="Redeem quantity"
              type="number"
              size="small"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              inputProps={{ min:1, max:redeemable ?? 1 }}
            />

            {priceWei && (
              <Typography variant="body2">
                Unlocks&nbsp;
                {ethers.formatEther(priceWei * BigInt(qty))}&nbsp;SETH
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

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open:false })}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open:false })}
          severity={toast.sev}
          variant="filled"
          sx={{ width:"100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}

DoormanPage.roles = ["Doorman"];
