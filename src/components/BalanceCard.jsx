// components/BalanceCard.jsx
import { Box, Typography } from "@mui/material";

export function BalanceCard({ title, value }) {
  return (
    <Box
      sx={{
        background: "background.paper",
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
        minWidth: 200,
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
