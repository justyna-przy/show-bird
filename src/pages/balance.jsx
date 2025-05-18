import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import { useWallet } from "@/hooks/useWallet";
import Balance from "@/components/Balance";

export default function BalancePage() {
  const { loadingRole } = useWallet();

  if (loadingRole) {
    return (
      <Box textAlign="center" margin={"auto"}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="2rem"
      margin={"auto"}
      paddingBottom={4}
    >
      <Typography variant="h4">Check Balance and Refund Tickets</Typography>
      <Balance />
    </Box>
  );
}
BalancePage.roles = ["Attendee", "Doorman", "Venue"];
