"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useWallet } from "@/hooks/useWallet";
import { ethers } from "ethers";

export default function AttendeeBalance() {
  const { address, provider, contract } = useWallet();
  const [eth, setEth] = useState(null);
  const [tickets, setTickets] = useState(null);

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
    <Box display="flex" gap={2} flexWrap="wrap">
      <Card>
        <CardContent>
          <Typography>Crypto Balance</Typography>
          <Typography variant="h6">
            {eth !== null ? `${eth} ETH` : "…"}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography>My Tickets</Typography>
          <Typography variant="h6">
            {tickets !== null ? tickets : "…"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
