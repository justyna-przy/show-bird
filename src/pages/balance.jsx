"use client";

import React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useWallet } from "@/hooks/useWallet";
import AttendeeBalance from "@/components/AttendeeBalance";
import DoormanBalance from "@/components/DoormanBalance";
import VenueBalance from "@/components/VenueBalance";

export default function BalancePage() {
  const {
    isConnected,
    loadingRoles,
    isVenue,
    isDoorman,
    isAttendee,
    connect,
  } = useWallet();

  /* ───────── connect first ───────── */
  if (!isConnected) {
    return (
      <Box textAlign="center" mt={8}>
        <Button variant="contained" onClick={connect}>
          Connect Wallet
        </Button>
      </Box>
    );
  }

  /* ───────── wait for role lookup ───────── */
  if (loadingRoles) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  /* ───────── show the appropriate UI ───────── */
  return (
    <Box
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
    >
      <Typography variant="h4">Check Balances</Typography>
      <Typography>
        You are logged in as{" "}
        <strong>
          {isVenue ? "Venue" : isDoorman ? "Doorman" : "Attendee"}
        </strong>
      </Typography>

      {isAttendee && <AttendeeBalance />}
      {isDoorman && <DoormanBalance />}
      {isVenue && <VenueBalance />}
    </Box>
  );
}
