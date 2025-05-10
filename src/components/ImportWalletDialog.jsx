import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography
} from "@mui/material";
import { Wallet } from "ethers";

const ImportWalletDialog = ({ open, onClose, onComplete }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    try {
      const wallet = Wallet.fromPhrase(mnemonic.trim());
      onComplete(wallet.address);
    } catch (e) {
      setError("Invalid seed phrase");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Import Wallet</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="12-word Seed Phrase"
          fullWidth
          multiline
          minRows={2}
          value={mnemonic}
          onChange={(e) => { setMnemonic(e.target.value); setError(""); }}
          error={!!error}
          helperText={error}
        />
        <Typography mt={2} variant="body2">
          (Keystore-file import could be added later.)
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleImport}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportWalletDialog;
