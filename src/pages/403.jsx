// pages/403.jsx
"use client";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function Forbidden() {
  return (
    <Box p={4} textAlign="center">
      <Typography variant="h3" gutterBottom>
        403 — Forbidden
      </Typography>
      <Typography gutterBottom>
        You don’t have permission to view this page.<br />
        Connect the right wallet or head back home.
      </Typography>
    </Box>
  );
}
