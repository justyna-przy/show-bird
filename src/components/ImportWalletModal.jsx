// components/ImportWalletDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Wallet } from "ethers";

/**
 * A modal that lets the user paste in a 12-word seed phrase
 * and recovers a Wallet.address.  
 * Calls onImported(addr) on success.
 */
export default function ImportWalletDialog({ open, onClose, onImported }) {
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState("");

  /**
   *  Takes the seed phrase, creates a wallet from it, and
   *  calls onImported with the wallet address.
   *  If the seed phrase is invalid, it sets an error message.
   */
  const handleImport = () => {
    try {
      const wallet = Wallet.fromPhrase(mnemonic.trim());
      onImported(wallet.address);
      onClose();
    } catch {
      setError("Invalid seed phrase");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Import Wallet</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="12-word Seed Phrase"
          value={mnemonic}
          onChange={(e) => {
            setMnemonic(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleImport}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
