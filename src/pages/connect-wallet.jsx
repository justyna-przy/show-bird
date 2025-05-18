import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { FaWallet, FaPlusCircle, FaDownload } from "react-icons/fa";
import { useWallet } from "@/hooks/useWallet";
import CreateWalletModal from "@/components/CreateWalletModal";
import ImportWalletModal from "@/components/ImportWalletModal";
import { useRouter } from "next/router";

/**
 * A full-page component that lets the user:
 *  - Connect an existing MetaMask/browser wallet
 *  - Create a brand-new wallet (opens CreateWalletDialog)
 *  - Import via seed phrase (opens ImportWalletDialog)
 */
export default function ConnectWallet() {
  const { address, connect, load } = useWallet();
  const [isCreating, setCreating] = useState(false);
  const [isImporting, setImporting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (address) router.replace("/tickets");
  }, [address, router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="2rem"
      margin={"auto"}
      paddingBottom={4}
    >
      <Typography variant="h4" align="center">
        Choose how you’d like to set up your wallet
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          maxWidth: 960,
          width: "100%",
          px: 2,
          justifyContent: "center",
        }}
      >
        {/* 1) Connect existing */}
        <Card sx={{ flex: 1, maxWidth: 300 }}>
          <CardActionArea
            onClick={connect}
            disabled={!!address}
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <FaWallet size={48} />
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Connect Wallet</Typography>
              <Typography color="text.secondary" variant="body2">
                Link your existing MetaMask/browser wallet
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* 2) Create new */}
        <Card sx={{ flex: 1, maxWidth: 300 }}>
          <CardActionArea
            onClick={() => setCreating(true)}
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <FaPlusCircle size={48} />
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Create Wallet</Typography>
              <Typography color="text.secondary" variant="body2">
                Generate a secure new wallet in seconds
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* 3) Import */}
        
      </Box>

      {/* Dialogs */}
      <CreateWalletModal
        open={isCreating}
        onClose={() => setCreating(false)}
        onCreated={load}
      />
      <ImportWalletModal
        open={isImporting}
        onClose={() => setImporting(false)}
        onImported={load}
      />
    </Box>
  );
}
