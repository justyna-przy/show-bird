import React from "react";
import { Typography, Box, TextField, Button } from "@mui/material";

/**
 * SetterCard component used in the dashboard page to render
 * consistent input fields and buttons for setting values such as 
 * ticket price, doorman address, and withdrawing funds
 */
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
