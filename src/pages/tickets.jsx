"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import theme from "@/styles/theme";

// ----- single hard-coded ticket data -----
const PIGEON_SHOW = {
  name: "Weekly Pigeon Show",
  price: 0.05,
  priceWei: ethers.parseEther("0.05"),
  info_tags: ["Every Friday", "7 pm - 9 pm", "Bird Plaza"],
  tags: ["birds", "live", "family"],
  image: "/images/pigeon-show2.png",
  description: `
  Step into the whimsical world of competitive cooing and feathered flair at the Weekly Pigeon Show — a family-friendly spectacle like no other.

  Each ticket includes:
  • Premium perch-side seating  
  • Complimentary sunflower seed snacks  
  • A meet-and-greet with our star pigeons after the show  

  Perfect for bird lovers, families, and curious newcomers alike!
  `,
};

const Tickets = () => {
  const [qty, setQty] = useState(1);

  /* toast state */
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });
  const show = (msg, sev = "info") => setToast({ open: true, msg, sev });

  /* wallet context */
  const {
    address,
    isConnected,
    isAttendee,
    provider,
    contract,
    signer, // TicketToken contract (read+write)
  } = useWallet();

  /* total in human + wei */
  const totalEth = (PIGEON_SHOW.price * qty).toFixed(2);
  const totalWei = PIGEON_SHOW.priceWei * BigInt(qty);

  const handleBuy = async () => {
    /* 0 — basic guards */
    if (!isConnected) {
      document.dispatchEvent(new Event("open-connect-modal"));
      return;
    }
    if (!isAttendee) {
      show("Only attendee wallets can buy tickets", "warning");
      return;
    }
    if (typeof window === "undefined" || !window.ethereum) {
      show("No Ethereum provider found", "error");
      return;
    }
  
    try {
      /* 1 — make MetaMask expose an account */
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      /* 2 — fresh BrowserProvider & signer (always sign-capable) */
      const browserProv = new ethers.BrowserProvider(window.ethereum);
      const signer      = await browserProv.getSigner();      // JsonRpcSigner
  
      /* 3 — balance check */
      const bal = await browserProv.getBalance(signer.address);
      if (bal < totalWei) {
        show("Insufficient ETH balance", "error");
        return;
      }
  
      /* 4 — brand-new contract wired to this signer */
      const write = new ethers.Contract(
        contract.target,          // address from your read instance
        contract.interface,       // ABI
        signer
      );
  
      /* 5 — purchase loop */
      for (let i = 0; i < qty; i++) {
        const tx = await write.buyTicket({ value: PIGEON_SHOW.priceWei });
        await tx.wait();
      }
  
      show(
        `Successfully bought ${qty} ticket${qty > 1 ? "s" : ""}!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      show("Transaction failed; see console for details.", "error");
    }
  };
  

  return (
    // Full-screen wrapper with light grey bg
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        minHeight: "calc(100vh - 80px)",
        pt: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Absolute centered card */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600, md: 900 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Left: image */}
        <Box sx={{ flex: "0 0 auto", width: { xs: "100%", md: "40%" } }}>
          <Image
            src={PIGEON_SHOW.image}
            alt={PIGEON_SHOW.name}
            width={600}
            height={600}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h2" gutterBottom>
              {PIGEON_SHOW.name}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1 }}>
              {PIGEON_SHOW.info_tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    borderRadius: "0.5rem",
                    color: theme.palette.primary.main,
                    bgcolor: "transparent",
                    border: `1px solid ${theme.palette.primary.main}`,
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1 }}>
              {PIGEON_SHOW.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    borderRadius: "0.5rem",
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.background.paper,
                  }}
                />
              ))}
            </Box>

            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: "pre-line" }}
            >
              {PIGEON_SHOW.description}
            </Typography>
          </Box>

          {/* Bottom payment controls */}
          <Box
            sx={{
              mt: "auto",
              p: 3,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              gap: 2,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <TextField
              label="Quantity"
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              sx={{ width: 120 }}
              size="small"
            />

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Total: {totalEth} ETH
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleBuy}
              disabled={!isConnected || !isAttendee}
            >
              Buy Tickets
            </Button>
          </Box>
        </Box>
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
    </Box>
  );
};

export default Tickets;
