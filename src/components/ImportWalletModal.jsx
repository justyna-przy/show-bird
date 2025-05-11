// components/ImportWalletDialog.jsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Input,
} from "@mui/material";
import { Wallet } from "ethers";

export default function ImportWalletDialog({ open, onClose, onImported }) {
  /** ───────── tab: 0 = seed, 1 = keystore ───────── */
  const [tab, setTab] = useState(0);

  /** ───────── seed-phrase state ───────── */
  const [mnemonic, setMnemonic] = useState("");
  const [seedError, setSeedError] = useState("");

  /** ───────── keystore state ───────── */
  const [fileName, setFileName] = useState("");
  const [json, setJson] = useState("");       // file contents
  const [password, setPassword] = useState("");
  const [keyError, setKeyError] = useState("");

  /* handle file upload */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setJson(ev.target.result);
    reader.readAsText(file);
    setKeyError("");
  };

  /* ───────── import handlers ───────── */
  const importSeed = () => {
    try {
      const wallet = Wallet.fromPhrase(mnemonic.trim());
      onImported(wallet.address);
      onClose();
    } catch {
      setSeedError("Invalid seed phrase");
    }
  };

  const importKeystore = async () => {
    if (!json) return setKeyError("Please choose a keystore file");
    try {
      const wallet = await Wallet.fromEncryptedJson(json, password || "password");
      onImported(wallet.address);
      onClose();
    } catch (e) {
      console.error(e);
      setKeyError("Wrong password or corrupted file");
    }
  };

  /* reset tabs on open/close */
  React.useEffect(() => {
    if (!open) {
      setTab(0);
      setMnemonic("");
      setSeedError("");
      setFileName("");
      setJson("");
      setPassword("");
      setKeyError("");
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Import Wallet</DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Seed Phrase" />
        <Tab label="Keystore File" />
      </Tabs>

      <DialogContent dividers>
        {tab === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="12-word Seed Phrase"
              value={mnemonic}
              onChange={(e) => {
                setMnemonic(e.target.value);
                setSeedError("");
              }}
              error={!!seedError}
              helperText={seedError}
            />
          </Box>
        )}

        {tab === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            {/* file picker */}
            <Button component="label" variant="outlined">
              {fileName || "Choose Keystore File"}
              <Input
                type="file"
                accept=".json"
                sx={{ display: "none" }}
                onChange={handleFile}
              />
            </Button>

            {/* password */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setKeyError("");
              }}
            />

            {keyError && (
              <Typography color="error" variant="body2">
                {keyError}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={tab === 0 ? importSeed : importKeystore}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
