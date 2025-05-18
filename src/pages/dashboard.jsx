// pages/dashboard.js   (or pages/dashboard.jsx)
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import { ethers } from "ethers";

import { useWallet }  from "@/hooks/useWallet";
import { useTicketSale }  from "@/hooks/useTicketSale";
import { useTicketToken } from "@/hooks/useTicketToken";

export default function DashboardPage() {
  /* ─── data & actions from hooks ────────────────────────── */
  const { isConnected, isVenue }              = useWallet();
  const {
    priceWei,
    totalSold,
    contractBalance,
    getRecentPurchases,
    setPrice,
    withdrawFunds,
  } = useTicketSale();
  const { assignDoorman } = useTicketToken();

  /* ─── local UI state ───────────────────────────────────── */
  const [recent,      setRecent]      = useState([]);
  const [newPrice,    setNewPrice]    = useState("");
  const [doormanAddr, setDoormanAddr] = useState("");
  const [withdrawAddr,setWithdrawAddr]= useState("");
  const [toast,       setToast]       = useState({ open:false, msg:"", severity:"info" });
  const notify = (msg, severity="success") => setToast({ open:true, msg, severity });

  /* ─── recent purchases ─────────────────────────────────── */
  useEffect(() => {
    if (!isVenue) return;
    getRecentPurchases(10)
      .then(setRecent)
      .catch((e) => {
        console.error(e);
        notify("Failed to load recent purchases", "error");
      });
  }, [isVenue, getRecentPurchases]);

  /* ─── guards ───────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <Box p={4}>
        <Typography variant="h6">
          Connect your wallet to view the dashboard.
        </Typography>
      </Box>
    );
  }
  if (!isVenue) {
    return (
      <Box p={4}>
        <Typography variant="h6">
          You are not the Venue owner. Access denied.
        </Typography>
      </Box>
    );
  }

  /* ─── derived numbers ─────────────────────────────────── */
  const priceEth = priceWei ? ethers.formatEther(priceWei) : "0";
  const revenueEth =
    priceWei && totalSold
      ? ethers.formatEther(priceWei * totalSold)        // BigInt math
      : "0";
  const balanceEth = contractBalance
    ? ethers.formatEther(contractBalance)
    : "0";

  /* ─── handlers ─────────────────────────────────────────── */
  const handleSetPrice = async () => {
    try {
      const wei = ethers.parseEther(newPrice);
      await setPrice(wei);
      notify(`Price updated to ${newPrice} SETH`);
    } catch (e) {
      console.error(e);
      notify("Failed to update price", "error");
    }
  };

  const handleAssignDoorman = async () => {
    try {
      await assignDoorman(doormanAddr, true);
      notify(`Doorman role granted to ${doormanAddr}`);
    } catch (e) {
      console.error(e);
      notify("Failed to assign doorman", "error");
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawFunds(withdrawAddr);
      notify(`Funds withdrawn to ${withdrawAddr}`);
    } catch (e) {
      console.error(e);
      notify("Withdrawal failed", "error");
    }
  };

  /* ─── UI ──────────────────────────────────────────────── */
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Venue Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Stats ------------------------------------------------ */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Stats</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Ticket Price: {priceEth} SETH</Typography>
            <Typography>Total Sold: {totalSold?.toString() ?? "…"}</Typography>
            <Typography>Revenue: {revenueEth} SETH</Typography>
            <Typography>Contract Balance: {balanceEth} SETH</Typography>
          </Paper>
        </Grid>

        {/* Controls -------------------------------------------- */}
        <Grid item xs={12} md={8}>
          {/* Set price */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6">Set Ticket Price</Typography>
            <Box mt={1} display="flex" gap={2}>
              <TextField
                label="New Price (SETH)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                size="small"
              />
              <Button variant="contained" onClick={handleSetPrice}>
                Update Price
              </Button>
            </Box>
          </Paper>

          {/* Doorman */}
          <Paper sx={{ p: 2, mb: 4 }}>
            <Typography variant="h6">Assign Doorman Role</Typography>
            <Box mt={1} display="flex" gap={2}>
              <TextField
                label="Wallet Address"
                value={doormanAddr}
                onChange={(e) => setDoormanAddr(e.target.value)}
                fullWidth
                size="small"
              />
              <Button variant="contained" onClick={handleAssignDoorman}>
                Grant Doorman
              </Button>
            </Box>
          </Paper>

          {/* Withdraw */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Withdraw Funds</Typography>
            <Box mt={1} display="flex" gap={2}>
              <TextField
                label="Recipient Address"
                value={withdrawAddr}
                onChange={(e) => setWithdrawAddr(e.target.value)}
                fullWidth
                size="small"
              />
              <Button variant="contained" onClick={handleWithdraw}>
                Withdraw
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent purchases ------------------------------------ */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            10 Most Recent Purchases
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.buyer.slice(0,6)}…{r.buyer.slice(-4)}</TableCell>
                    <TableCell>{r.qty}</TableCell>
                    <TableCell>{r.timestamp.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No purchases yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width:"100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
DashboardPage.roles = ["Venue"];