import React from "react";
import { Box, Typography } from "@mui/material";

const About = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        mt: 4,
        width: { xs: "100%", md: "70%" },
        mx: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        About ShowBird
      </Typography>
      <Typography variant="body1" paragraph>
        ShowBird is a platform dedicated to bringing bird enthusiasts together
        through live events and shows. Our mission is to create a vibrant
        community where bird lovers can connect, share experiences, and enjoy
        the beauty of avian life.
      </Typography>
      <Typography variant="body1" paragraph>
        We believe in the power of nature and the joy that birds bring to our
        lives. Join us in celebrating these magnificent creatures and be part of
        our growing community!
      </Typography>
    </Box>
  );
};

export default About;