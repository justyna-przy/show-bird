// components/WalletButton.jsx
import React from "react";
import { Chip, Avatar, Button } from "@mui/material";
import Jazzicon from "react-jazzicon";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";

const shorten = (addr) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

const WalletButton = () => {
  const { address, owner, disconnect } = useWallet();
  const router = useRouter();

  /* ▸  Not connected → go to /connect-wallet  */
  if (!address) {
    return (
      <Button
        variant="contained"
        onClick={() => router.push("/connect-wallet")}
      >
        Connect&nbsp;Wallet
      </Button>
    );
  }

  /* ▸  Connected → show chip with Jazzicon and allow disconnect */
  return (
    <Chip
      avatar={
        <Avatar sx={{ bgcolor: "transparent" }}>
          <Jazzicon
            diameter={20}
            seed={parseInt(address.slice(2, 10), 16)}
          />
        </Avatar>
      }
      label={owner ? `Admin · ${shorten(address)}` : shorten(address)}
      onClick={disconnect}
      sx={{ cursor: "pointer", fontWeight: 600 }}
    />
  );
};

export default WalletButton;
