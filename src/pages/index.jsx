import React from "react";
import LandingIntro from "@/components/LandingIntro";
import { Box } from "@mui/system";

const Index = () => {
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
