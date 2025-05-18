import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
} from "@mui/material";
import { ethers } from "ethers";
import { useToast } from "@/components/ToastContext";
import { useWallet } from "@/hooks/useWallet";
import { useTicketSale } from "@/hooks/useTicketSale";
import { useTicketToken } from "@/hooks/useTicketToken";
import { useTheme } from "@mui/material/styles";
import SetterCard from "@/components/SetterCard";

export default function DashboardPage() {
  // Hooks
  const { isVenue } = useWallet();
  const {
    priceWei,
    totalSold,
    contractBalance,
    getRecentPurchases,
    setPrice,
    withdrawFunds,
    revenueWei,
    purchased,
  } = useTicketSale();
  const { assignDoorman } = useTicketToken();
  const theme = useTheme();
  const toast = useToast();

  // Local state
  const [recent, setRecent] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [doormanAddr, setDoormanAddr] = useState("");
  const [withdrawAddr, setWithdrawAddr] = useState("");

  // Prefilled skeleton rows
  const skeletonRows = Array.from({ length: 10 }, (_, i) => ({
    buyer: "—",
    qty: "—",
    timestamp: "—",
    key: `sk${i}`,
  }));

  // Retrieve recent purchases when the component mounts
  useEffect(() => {
    if (!isVenue) return;
    getRecentPurchases(10)
      .then(setRecent)
      .catch((e) => {
        console.error(e);
        toast.error("Failed to fetch recent purchases");
      });
  }, [isVenue, getRecentPurchases, toast]);

  // Format values
  const priceEth = priceWei ? ethers.formatEther(priceWei) : "0";
  const revenueEth = revenueWei ? ethers.formatEther(revenueWei) : "0";
  const balanceEth = contractBalance
    ? ethers.formatEther(contractBalance)
    : "0";

  // Handlers
  const handleSetPrice = async () => {
    try {
      const wei = ethers.parseEther(newPrice);
      await setPrice(wei);
      toast.success(`Price updated to ${newPrice} SETH`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to set price");
    }
  };

  const handleAssignDoorman = async () => {
    try {
      await assignDoorman(doormanAddr, true);
      toast.success(`Doorman role granted to ${doormanAddr}`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign doorman");
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawFunds(withdrawAddr);
      toast.success(`Funds withdrawn to ${withdrawAddr}`);
    } catch (e) {
      console.error(e);
      toast.error("Withdrawal failed");
    }
  };

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
            <Typography variant="h5" fontWeight={500} color="white">
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
            <Typography variant="h5" fontWeight={500} color="white">
              {totalSold?.toString() ?? "0"}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Lifetime Sold
            </Typography>
            <Typography variant="h5" color="white">
              {purchased?.toString() ?? "0"}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Outstanding
            </Typography>
            <Typography variant="h5" color="white">
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
            <Typography variant="h5" fontWeight={500} color="white">
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
            <Typography variant="h5" fontWeight={500} color="white">
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

        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          justifyContent="center"
          padding={2}
        >
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
    </Box>
  );
}

DashboardPage.roles = ["Venue"];
