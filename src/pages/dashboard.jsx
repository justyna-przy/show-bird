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

import { useWallet } from "@/hooks/useWallet";
import { useTicketSale } from "@/hooks/useTicketSale";
import { useTicketToken } from "@/hooks/useTicketToken";
import { useTheme } from "@mui/material/styles";
import SetterCard from "@/components/SetterCard";

export default function DashboardPage() {
  /* ─── data & actions from hooks ────────────────────────── */
  const { isConnected, isVenue } = useWallet();
  const {
    priceWei,
    totalSold,
    contractBalance,
    getRecentPurchases,
    setPrice,
    withdrawFunds,
  } = useTicketSale();
  const { assignDoorman } = useTicketToken();
  const theme = useTheme();

  /* ─── local UI state ───────────────────────────────────── */
  const [recent, setRecent] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [doormanAddr, setDoormanAddr] = useState("");
  const [withdrawAddr, setWithdrawAddr] = useState("");
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "info",
  });
  const notify = (msg, severity = "success") =>
    setToast({ open: true, msg, severity });

  const skeletonRows = Array.from({ length: 10 }, (_, i) => ({
    buyer: "—",
    qty: "—",
    timestamp: "—",
    key: `sk${i}`,
  }));
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

  /* ─── derived numbers ─────────────────────────────────── */
  const priceEth = priceWei ? ethers.formatEther(priceWei) : "0";
  const revenueEth =
    priceWei && totalSold
      ? ethers.formatEther(priceWei * totalSold) // BigInt math
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="2rem"
      margin={"auto"}
    >
      <Typography variant="h4">Venue Dashboard</Typography>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        marginBottom={4}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          border: `2px solid ${theme.palette.primary.light}`,
          overflow: "hidden",
          alignItems: "center",
        }}
      >
        {/* 3 sections, stats, operations, 10 most recent */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent={"space-between"}
          gap={3}
          sx={{ p: 6, bgcolor: theme.palette.primary.main }}
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Ticket Price
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {priceEth} SETH
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Total Sold
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {totalSold?.toString() ?? "0"}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Revenue
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {revenueEth} SETH
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Contract Balance
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {balanceEth} SETH
            </Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent={"space-between"}
          gap={2}
        >
          <SetterCard
            title="Set Ticket Price"
            inputLabel="New Price (SETH)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            buttonText="Update Price"
            onClick={handleSetPrice}
          />
          <SetterCard
            title="Assign Doorman Role"
            inputLabel="Wallet Address"
            value={doormanAddr}
            onChange={(e) => setDoormanAddr(e.target.value)}
            buttonText="Grant Doorman"
            onClick={handleAssignDoorman}
          />
          <SetterCard
            title="Withdraw Funds"
            inputLabel="Recipient Address"
            value={withdrawAddr}
            onChange={(e) => setWithdrawAddr(e.target.value)}
            buttonText="Withdraw"
            onClick={handleWithdraw}
          />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Box display="flex" flexDirection="column" gap={2} justifyContent="center" padding={2}>
          <Typography variant="h5" gutterBottom>
            10 Most Recent Purchases
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              width: 400,
              border: "none",
              boxShadow: 0,

            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(recent.length ? recent : skeletonRows).map((r, i) => (
                  <TableRow key={r.key ?? i}>
                    <TableCell>
                      {typeof r.buyer === "string"
                        ? r.buyer.length > 10
                          ? `${r.buyer.slice(0, 6)}…${r.buyer.slice(-4)}`
                          : r.buyer
                        : "—"}
                    </TableCell>
                    <TableCell>{r.qty}</TableCell>
                    <TableCell>
                      {r.timestamp?.toLocaleString?.() ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

DashboardPage.roles = ["Venue"];
