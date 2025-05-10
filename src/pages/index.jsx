import { Typography } from "@mui/material";
import React from "react";
import { useTheme } from "@mui/material/styles";
import LandingIntro from "@/components/LandingIntro";
import { Box, width } from "@mui/system";
import Ticket from "@/components/Ticket";

const Index = () => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100rem",
          margin: "0 auto",
        }}
      >
        <LandingIntro />
      </Box>
      
      

    </>
  );
};
export default Index;
