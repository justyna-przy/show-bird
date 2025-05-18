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
import { useToast } from "@/components/ToastContext";

/**
 * A modal that lets the user generate a brand-new Ethereum
 * wallet, download its keystore file, and surface the address
 * back to the parent via onCreated.
 */
export default function CreateWalletModal({ open, onClose }) {
  const [password, setPassword] = useState("");
  const toast = useToast();

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

    // 2) Download the raw private key as a .txt file
    const pkBlob = new Blob([wallet.privateKey], { type: "text/plain" });
    const pkUrl = URL.createObjectURL(pkBlob);
    const a2 = document.createElement("a");
    a2.href = pkUrl;
    a2.download = "showbird-private-key.txt";
    a2.click();
    URL.revokeObjectURL(pkUrl);

    // 3) Let the user know via toast
    toast.info(
      "Import the keystore file or private key into your wallet app to access your new account.",
    );

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
