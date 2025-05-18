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
    connect,
    disconnect,
    loadingRole,
    isVenue,
    isDoorman,
    isAttendee,
  } = useWallet();
  const router = useRouter();

  // Always call hooks before any returns:
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  // 1) Not connected: show a connect button
  if (!isConnected) {
    return (
      <Button variant="contained" onClick={connect}>
        Connect&nbsp;Wallet
      </Button>
    );
  }

  // 2) Connected: show address + menu
  const roleLabel = loadingRole
    ? "Loading…"
    : isVenue
    ? "Venue"
    : isDoorman
    ? "Doorman"
    : isAttendee
    ? "Attendee"
    : "Unknown";

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const copyAddr = async () => {
    await navigator.clipboard.writeText(address);
    close();
  };

  // keep menu width in sync with chip
  const menuWidth = anchorEl?.offsetWidth;

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
        sx={{
          cursor: "pointer",
          fontWeight: 600,
          height: "2.5rem",
          fontSize: "1rem",
          borderRadius: "1.5rem",
          px: 1,
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        PaperProps={{ sx: { width: menuWidth } }}
      >
        <MenuItem disableRipple sx={{ pointerEvents: "none" }}>
          <Typography variant="body2">Role: {roleLabel}</Typography>
        </MenuItem>

        <MenuItem onClick={copyAddr}>
          <FaRegCopy style={{ marginRight: 8 }} />
          Copy&nbsp;Address
        </MenuItem>

        <MenuItem
          onClick={() => {
            disconnect();
            close();
          }}
        >
          Disconnect
        </MenuItem>
      </Menu>
    </>
  );
}
