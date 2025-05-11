"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";
import { useTheme } from "@mui/material/styles";

export default function AttendeeBalance() {
  const { address, provider, contract } = useWallet();
  const [eth, setEth] = useState(null);
  const [tickets, setTickets] = useState(null);
    const theme = useTheme();

  useEffect(() => {
    if (!address) return;

    (async () => {
      /* ETH */
      const raw = await provider.getBalance(address);
      setEth(ethers.formatEther(raw));

      /* Tickets via read-only replica */
      const read = contract.connect(provider);
      const tk = await read.balanceOf(address);
      setTickets(Number(tk));
    })();
  }, [address, provider, contract]);

  return (
    <Box
  display="flex"
  gap={3}
  flexWrap="wrap"
  sx={{ mt: 2 }}
>
  {/* ─── ETH card ─── */}
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

  {/* ─── Tickets card ─── */}
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
</Box>

  );
}
