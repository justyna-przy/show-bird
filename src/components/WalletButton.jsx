import React, { useState } from "react";
import { Chip, Avatar, Button } from "@mui/material";
import Jazzicon from "react-jazzicon";
import ConnectWalletModal from "./ConnectWalletModal";
import { useWallet } from "@/hooks/useWallet";

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const WalletButton = () => {
  const { address, owner, disconnect, load, connect } = useWallet();
  const [open, setOpen] = useState(false);

  // when modal completes
  const handleConnect = (addr) => load(addr);

  if (!address) {
    return (
      <>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Connect&nbsp;Wallet
        </Button>
        <ConnectWalletModal
          open={open}
          onClose={() => setOpen(false)}
          onConnect={handleConnect}
          connectMetaMask={connect}
        />
      </>
    );
  }

  return (
    <Chip
      avatar={
        <Avatar sx={{ bgcolor: "transparent" }}>
          <Jazzicon diameter={20} seed={parseInt(address.slice(2, 10), 16)} />
        </Avatar>
      }
      label={owner ? `Admin · ${shorten(address)}` : shorten(address)}
      onClick={disconnect}
      sx={{ cursor: "pointer", fontWeight: 600 }}
    />
  );
};

export default WalletButton;
