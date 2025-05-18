import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { ethers } from "ethers";
import { useTheme } from "@mui/material/styles";
import { useToast } from "@/components/ToastContext";
import { useWallet } from "@/hooks/useWallet";
import { useTicketToken } from "@/hooks/useTicketToken";
import { useTicketSale } from "@/hooks/useTicketSale";

export default function Balance() {
  // Hooks
  const theme = useTheme();
  const toast = useToast();
  const { address, provider } = useWallet();
  const { tokenRead } = useTicketToken();

  // Local state
  const [eth, setEth] = useState(null);
  const [tickets, setTickets] = useState(null);
  const { priceWei, refundPct, refundTickets } = useTicketSale();
  const [refundQty, setRefundQty] = useState(1);

  // useEffect is called when the component mounts or when address, provider, or tokenRead changes
  useEffect(() => {
    if (!address || !provider || !tokenRead) return;

    let stale = false;
    (async () => {
      try {
        const [rawEth, tk] = await Promise.all([
          provider.getBalance(address),
          tokenRead.balanceOf(address),
        ]);
        if (!stale) {
          setEth(ethers.formatEther(rawEth));
          setTickets(Number(tk));
        }
      } catch (e) {
        toast.error("Failed to fetch balance");
      }
    })();

    return () => {
      stale = true;
    };
  }, [address, provider, tokenRead]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        sx={{
          bgcolor: theme.palette.primary.main,
          borderRadius: 2,
          border: `2px solid ${theme.palette.primary.light}`,
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent={"space-between"}
          gap={3}
          sx={{ p: 6 }}
        >
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              Crypto Balance
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {eth !== null ? `${Number(eth).toFixed(5)} ETH` : "0"}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600 }}
            >
              My Tickets
            </Typography>
            <Typography variant="h4" fontWeight={500} color="white">
              {tickets !== null ? tickets : "0"}
            </Typography>
          </Box>
        </Box>
        {priceWei && refundPct !== null && (
          <Card
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 0,
              padding: 4,
              gap: 2,
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                fontSize={"1.2rem"}
              >
                Refund Tickets ({refundPct}% back)
              </Typography>

              <TextField
                label="Quantity"
                type="number"
                size="medium"
                value={refundQty}
                onChange={(e) =>
                  setRefundQty(Math.max(1, Number(e.target.value)))
                }
                slotProps={{ min: 1, max: tickets ?? 1 }}
              />

              <Typography variant="body2" fontSize="1.1rem">
                You’ll receive&nbsp;
                {ethers.formatEther(
                  (BigInt(priceWei) * BigInt(refundQty) * BigInt(refundPct)) /
                    100n
                )}{" "}
                SETH
              </Typography>

              <Button
                variant="contained"
                size="large"
                disabled={!tickets || refundQty > tickets}
                onClick={async () => {
                  try {
                    await refundTickets(refundQty);
                    toast.success(
                      `Refunded ${refundQty} tickets for ${ethers.formatEther(
                        (BigInt(priceWei) *
                          BigInt(refundQty) *
                          BigInt(refundPct)) /
                          100n
                      )} SETH`
                    );
                  } catch (e) {
                    console.error(e);
                    toast.error("Refund failed");
                  }
                }}
              >
                Refund
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
}
