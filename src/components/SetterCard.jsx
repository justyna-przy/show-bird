// components/SetterCard.jsx
"use client";

import React from "react";
import { Paper, Typography, Box, TextField, Button } from "@mui/material";

export default function SetterCard({
  title,
  inputLabel,
  value,
  onChange,
  buttonText,
  onClick,
  disabled = false,
}) {
  return (
    <Box
      sx={{
        padding: 1,
        px: 4,
        margin: "auto",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>

      <Box mt={1} display="flex" gap={2} flexDirection={"column"}>
        <TextField
          label={inputLabel}
          value={value}
          onChange={onChange}
          fullWidth
          size="small"
          sx={{ width: 260}} 
        />
        <Button variant="contained" onClick={onClick} sx={{ width: 150, fontSize: '0.8rem' }} >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
}
