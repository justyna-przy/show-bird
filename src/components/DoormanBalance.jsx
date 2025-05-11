"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useWallet } from "@/hooks/useWallet";

export default function DoormanBalance() {
  const { contract, provider } = useWallet();
  const [addr, setAddr] = useState("");
  const [tickets, setTickets] = useState(null);

  const check = async () => {
    try {
      const read = contract.connect(provider);
      const raw = await read.balanceOf(addr.trim());
      setTickets(Number(raw));
    } catch (e) {
      console.error(e);
      setTickets(null);
      alert("Bad address or on-chain error");
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Attendee Address"
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
      />
      <Button variant="contained" onClick={check}>
        Check
      </Button>

      {tickets !== null && (
        <Card>
          <CardContent>
            <Typography>Has Ticket?</Typography>
            <Typography variant="h6">{tickets > 0 ? "✅" : "❌"}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
