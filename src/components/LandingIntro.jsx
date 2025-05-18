import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

const LandingIntro = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: { xs: "1rem auto", sm: "2rem auto" },
        width: { xs: "100%", sm: "80%", md: "70%" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "left",
          gap: "1rem",
          width: "auto",
        }}
      >
        <Typography variant="h1">Your Ticket Just Landed.</Typography>
        <Typography variant="h2">
          Decentralized Ticketing for a Trustless Future.
        </Typography>
        <Typography variant="body1" sx={{ marginTop: "1rem", width: "70%"}}>
          ShowBird is a Web3-native ticketing platform where users mint, trade,
          and verify event access as blockchain tokens. No middlemen. No fake
          tickets. Just secure, verifiable ownership.
        </Typography>
      </Box>
      <Image
        src="/images/pigeon.png"
        alt="Waving Pigeon"
        width={360}
        height={540}
      />
    </Box>
  );
};

export default LandingIntro;
