// components/WalletButton.jsx
"use client";

import React, { useState } from "react";
import {
  Chip,
  Avatar,
  Button,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Jazzicon from "react-jazzicon";
import { FaRegCopy } from "react-icons/fa";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export default function WalletButton() {
  const {
    address,
    isConnected,
    disconnect,
    loadingRoles,
    isVenue,
    isDoorman,
    isAttendee,
  } = useWallet();
  const router = useRouter();

  /* ────────────── Not connected ────────────── */
  if (!isConnected) {
    return (
      <Button
        variant="contained"
        onClick={() => router.push("/connect-wallet")}
      >
        Connect&nbsp;Wallet
      </Button>
    );
  }

  /* ────────────── Connected ────────────── */
  const roleLabel = loadingRoles
    ? "Loading…"
    : isVenue
    ? "Venue"
    : isDoorman
    ? "Doorman"
    : isAttendee
    ? "Attendee"
    : "Unknown";

  /*  anchor & copy helpers  */
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const copyAddr = async () => {
    await navigator.clipboard.writeText(address);
    handleClose();
  };

  /*  menu width matches chip width  */
  const menuWidth = anchorEl ? anchorEl.offsetWidth : undefined;

  return (
    <>
      <Chip
        avatar={
          <Avatar sx={{ bgcolor: "transparent" }}>
            <Jazzicon diameter={20} seed={parseInt(address.slice(2, 10), 16)} />
          </Avatar>
        }
        label={shorten(address)}
        onClick={handleOpen}
        sx={{ cursor: "pointer", fontWeight: 600, height: "2.5rem", fontSize: "1rem", borderRadius: "1.5rem", paddingX: "0.5rem", paddingY: "0.5rem" }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { width: menuWidth } }}
  
      >
        {/* Role line – normal text */}
        <MenuItem disableRipple sx={{ pointerEvents: "none" }}>
          <Typography variant="body2">Role: {roleLabel}</Typography>
        </MenuItem>

        {/* Copy with icon */}
        <MenuItem onClick={copyAddr}>
          <FaRegCopy style={{ marginRight: 8 }} />
          Copy&nbsp;Address
        </MenuItem>

        {/* Disconnect */}
        <MenuItem
          onClick={() => {
            disconnect();
            handleClose();
          }}
        >
          Disconnect
        </MenuItem>
      </Menu>
    </>
  );
}
