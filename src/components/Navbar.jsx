import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Box, Typography, useTheme, styled } from "@mui/material";
import Image from "next/image";

const NavLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontFamily: "'Sour Gummy', sans-serif",
    fontSize: "1.4rem",
    fontWeight: 400,
    "&:hover": {
        color: theme.palette.primary.main,
    },
}));

const Navbar = () => {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.background.default,
        display: "flex",
        justifyContent: "space-between",
        padding: "0.5rem 2rem",
        flexDirection: "row",
        alignItems: "center",
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Image 
            src="/images/logo.png"
            alt="logo"
            width={60}
            height={60}
        />
        <Link href="/">
          <Typography
            sx={{
              fontFamily: "'Sour Gummy', sans-serif",
              color: theme.palette.text.primary,
              fontSize: "2.5rem",
              fontWeight: 600,
            }}
          >
            ShowBird
          </Typography>
        </Link>
      </Box>
      <Toolbar sx={{ gap: "1rem"}}>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/events">Events</NavLink>
        <NavLink href="/tickets">Tickets</NavLink>
        <NavLink href="/about">About</NavLink>
      </Toolbar>
      {/* Login / signup button */}
        <Box sx={{ display: "flex", gap: "1rem" }}>
            <Link href="/login">
            <Typography
                sx={{
                fontFamily: "'Sour Gummy', sans-serif",
                color: theme.palette.text.primary,
                fontSize: "1.4rem",
                fontWeight: 400,
                }}
            >
                Login
            </Typography>
            </Link>
            <Link href="/signup">
            <Typography
                sx={{
                fontFamily: "'Sour Gummy', sans-serif",
                color: theme.palette.primary.main,
                fontSize: "1.4rem",
                fontWeight: 400,
                }}
            >
                Sign Up
            </Typography>
            </Link>
        </Box>
    </AppBar>
  );
};

export default Navbar;
