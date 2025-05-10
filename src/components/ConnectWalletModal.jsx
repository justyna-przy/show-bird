import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import InputIcon from "@mui/icons-material/Input";
import { Wallet } from "ethers";

const Transition = (props) => <Slide direction="left" {...props} />;

/**
 * Props:
 *  open        : boolean
 *  onClose()   : void
 *  onConnect(addr:string) : void   // called when a wallet address is ready
 */
const ConnectWalletModal = ({ open, onClose, onConnect }) => {
  const hasProvider =
    typeof window !== "undefined" && Boolean(window.ethereum);

  /* step = 0 (menu) | 1 (create) | 2 (import) */
  const [step, setStep] = useState(0);

  // sub-state for create/import
  const [pwd, setPwd] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStep(0);
    setPwd("");
    setMnemonic("");
    setError("");
  };

  // ---- MetaMask flow ----
  const handleMetaMask = async () => {
    if (!hasProvider) return;
    const [addr] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    onConnect(addr);
    onClose();
    reset();
  };

  // ---- Create new wallet ----
  const handleGenerate = async () => {
    const wallet = Wallet.createRandom();
    const json = await wallet.encrypt(pwd || "password");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "showbird-wallet.json",
    });
    a.click();
    URL.revokeObjectURL(url);

    onConnect(wallet.address);
    onClose();
    reset();
  };

  // ---- Import wallet ----
  const handleImport = () => {
    try {
      const wallet = Wallet.fromPhrase(mnemonic.trim());
      onConnect(wallet.address);
      onClose();
      reset();
    } catch {
      setError("Invalid seed phrase");
    }
  };

  /* ---------- STEP 0 : MENU ---------- */
  const menu = (
    <List sx={{ minWidth: 260 }}>
      <ListItem
        button
        disabled={!hasProvider}
        onClick={handleMetaMask}
      >
        <ListItemIcon>
          <AccountBalanceWalletIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            hasProvider ? "MetaMask / Browser Wallet" : "No Browser Wallet"
          }
        />
      </ListItem>

      <ListItem button onClick={() => setStep(1)}>
        <ListItemIcon><AddIcon /></ListItemIcon>
        <ListItemText primary="Create New Wallet" />
      </ListItem>

      <ListItem button onClick={() => setStep(2)}>
        <ListItemIcon><InputIcon /></ListItemIcon>
        <ListItemText primary="Import Wallet" />
      </ListItem>
    </List>
  );

  /* ---------- STEP 1 : CREATE ---------- */
  const create = (
    <>
      <TextField
        label="Password (optional)"
        type="password"
        fullWidth
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        sx={{ mt: 1 }}
      />
      <Typography variant="body2" sx={{ mt: 2 }}>
        A keystore file will be downloaded. Store it safely.
      </Typography>
      <DialogActions sx={{ mt: 1 }}>
        <Button onClick={reset}>Back</Button>
        <Button variant="contained" onClick={handleGenerate}>
          Generate
        </Button>
      </DialogActions>
    </>
  );

  /* ---------- STEP 2 : IMPORT ---------- */
  const imp = (
    <>
      <TextField
        label="12-word Seed Phrase"
        fullWidth
        multiline
        minRows={2}
        value={mnemonic}
        error={!!error}
        helperText={error}
        onChange={(e) => {
          setMnemonic(e.target.value);
          setError("");
        }}
        sx={{ mt: 1 }}
      />
      <DialogActions sx={{ mt: 1 }}>
        <Button onClick={reset}>Back</Button>
        <Button variant="contained" onClick={handleImport}>
          Import
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); }}
      TransitionComponent={Transition}
    >
      <DialogTitle>
        {step === 0 ? "Connect Wallet" : step === 1 ? "Create Wallet" : "Import Wallet"}
      </DialogTitle>
      <DialogContent dividers>
        {step === 0 && menu}
        {step === 1 && create}
        {step === 2 && imp}
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
