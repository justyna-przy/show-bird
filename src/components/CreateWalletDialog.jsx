import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField
} from "@mui/material";
import { Wallet } from "ethers";

const CreateWalletDialog = ({ open, onClose, onComplete }) => {
  const [pwd, setPwd] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  const handleGenerate = async () => {
    const wallet = Wallet.createRandom();
    setMnemonic(wallet.mnemonic.phrase);

    const json = await wallet.encrypt(pwd || "password");
    const blob = new Blob([json], { type: "application/json" });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "showbird-wallet.json";
    a.click();
    URL.revokeObjectURL(url);

    onComplete(wallet.address);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Create New Wallet</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Enter a password to encrypt your keystore (optional):
        </Typography>
        <TextField
          type="password"
          label="Password"
          fullWidth
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        {mnemonic && (
          <Typography mt={2} sx={{ wordBreak: "break-word" }}>
            <b>Seed phrase:</b> {mnemonic}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleGenerate}>
          Generate & Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWalletDialog;
