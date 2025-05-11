import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { Wallet } from "ethers";

/**
 * A modal that lets the user generate a brand-new Ethereum
 * wallet, download its keystore file, and surface the address
 * back to the parent via onCreated.
 */
export default function CreateWalletModal({ open, onClose, onCreated }) {
  const [password, setPassword] = useState("");

  /**
   *  Generates a new random wallet, 
   *  encrypt it with an optional password, 
   *  and download the keystore file using ethers.
   */
  const handleGenerate = async () => {
    const wallet = Wallet.createRandom();
    const json = await wallet.encrypt(password || "password");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "showbird-wallet.json";
    a.click();
    URL.revokeObjectURL(url);

    // Tells the parent component that we have an address and closes the modal
    onCreated(wallet.address);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Wallet</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="dense"
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          We’ll download a keystore file—keep it somewhere safe!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleGenerate}>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
}
