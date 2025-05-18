import React, { useState } from "react";
import { Box, Typography, TextField, Button, Chip } from "@mui/material";
import { ethers } from "ethers";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";
import { useTicketSale } from "@/hooks/useTicketSale";
import { useToast } from "@/components/ToastContext";
import { useTheme } from "@mui/material/styles";

// Pigeon show data to be rendered in the ticket
const PIGEON_SHOW = {
  name: "Weekly Pigeon Show",
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
  // Hooks
  const theme = useTheme();
  const toast = useToast();
  const { isConnected, isAttendee, connect } = useWallet();
  const { priceWei, buyTickets } = useTicketSale();

  // Local state
  const [qty, setQty] = useState(1);

  const totalEth = priceWei
    ? (Number(ethers.formatEther(priceWei)) * qty).toFixed(3)
    : "0";

  // Handler
  const handleBuy = async () => {
    if (!isConnected) return connect();

    try {
      await buyTickets(qty, priceWei);
      toast.success(`Successfully bought ${qty} ticket${qty > 1 ? "s" : ""}!`);
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to buy tickets. Please check your wallet and try again."
      );
    }
  };

  return (
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
              disabled={!priceWei || !isConnected || !isAttendee}
            >
              Buy Tickets
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Tickets;
