// pages/connect-wallet.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { FaWallet, FaPlusCircle, FaDownload } from "react-icons/fa";
import { Wallet } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import theme from "@/styles/theme";

/* ------------------------------------------------------------------------ */
/*  DIALOG 1 : CREATE NEW WALLET                                            */
/* ------------------------------------------------------------------------ */
const CreateWalletDialog = ({ open, onClose, onCreated }) => {
  const [pwd, setPwd] = useState("");

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

    onCreated(wallet.address);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Wallet</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Password (optional)"
          type="password"
          fullWidth
          sx={{ mt: 1 }}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          A keystore file will be downloaded. Store it safely.
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
};

/* ------------------------------------------------------------------------ */
/*  DIALOG 2 : IMPORT WALLET                                                */
/* ------------------------------------------------------------------------ */
const ImportWalletDialog = ({ open, onClose, onImported }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState("");

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

/* ------------------------------------------------------------------------ */
/*  MAIN PAGE : CHOOSE WALLET FLOW                                          */
/* ------------------------------------------------------------------------ */
const ConnectWalletPage = () => {
  const { address, connect, load } = useWallet(); // `load` will accept addr
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      {/* ------------ header + card row ------------ */}
      <Box
        sx={{
          flex: 1, 
          bgcolor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", 
          gap: 4,
        }}
      >
        <Typography variant="h2" color={theme.palette.text.secondary}>
          Choose how you’d like to set up your wallet.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            width: "100%",
            maxWidth: 1000,
            px: 2,
            justifyContent: "center",
          }}
        >
          {/* CONNECT EXISTING ------------------------------------------------ */}
          <Card sx={{ flex: 1, maxWidth: 300 }}>
            <CardActionArea
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
              onClick={connect}
              disabled={!!address}
            >
              <FaWallet size={48} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Connect Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Link your existing MetaMask or browser wallet.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* CREATE NEW ------------------------------------------------------ */}
          <Card sx={{ flex: 1, maxWidth: 300 }}>
            <CardActionArea
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
              onClick={() => setCreateOpen(true)}
            >
              <FaPlusCircle size={48} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Create Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate a secure new wallet in seconds.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* IMPORT ---------------------------------------------------------- */}
          <Card sx={{ flex: 1, maxWidth: 300 }}>
            <CardActionArea
              sx={{
                py: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
              onClick={() => setImportOpen(true)}
            >
              <FaDownload size={48} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Import Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Restore with a seed phrase or keystore file.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Box>

      {/* ------------ CREATE WALLET DIALOG ------------ */}
      <CreateWalletDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load} /* call load(addr) from your hook */
      />

      {/* ------------ IMPORT WALLET DIALOG ------------ */}
      <ImportWalletDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={load} /* call load(addr) from your hook */
      />
    </>
  );
};

export default ConnectWalletPage;
