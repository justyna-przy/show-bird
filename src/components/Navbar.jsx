// components/Navbar.jsx
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import { FaBars } from "react-icons/fa";
import WalletButton from "@/components/WalletButton";
import { useWallet } from "@/hooks/useWallet";

const NavLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "1.15rem",
  fontWeight: 600,
  textDecoration: "none",
  "&:hover": { color: theme.palette.primary.main },
}));

const Navbar = () => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const { address, owner, connect, disconnect } = useWallet();

  // ------------- links (My Tickets + Verify only when connected) -------------
  const base = [
    { title: "Home", path: "/" },
    { title: "About", path: "/about" },
    { title: "Tickets", path: "/tickets" },
  ];
  const auth   = address ? [
    { title: "Balance", path: "/balance" },
    { title: "Transfer", path: "/transfer" },

  ] : [];
  const admin  = owner ? [{ title: "Dashboard", path: "/dashboard" }] : [];

  const links = [...base, ...auth, ...admin];

  // ---------------- drawer content (mobile) ----------------
  const drawer = (
    <Box sx={{ width: 250, p: 2 }} onClick={() => setOpen(false)}>
      <List>
        {links.map(({ title, path }) => (
          <ListItem key={title} disablePadding>
            <ListItemText>
              <NavLink href={path}>{title}</NavLink>
            </ListItemText>
          </ListItem>
        ))}
      </List>
      <WalletButton
        address={address}
        owner={owner}
        connect={connect}
        disconnect={disconnect}
      />
    </Box>
  );

  return (
    <AppBar position="static"
      sx={{ bgcolor: theme.palette.background.default, boxShadow: "none" }}>
      <Toolbar
        sx={{
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* ---------- left: logo ---------- */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <Image src="/images/logo3.png" alt="logo" width={50} height={50}
                 style={{ transform: "scaleX(-1)" }} />
          <NavLink href="/" style={{
            fontFamily: "'Roca Two',sans-serif",
            fontSize: "2rem",
            marginLeft: 8,
          }}>
            ShowBird
          </NavLink>
        </Box>

        {/* ---------- centre: nav links (desktop only) ---------- */}
        {!isMobile && (
          <Box sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            gap: 3,
          }}>
            {links.map(({ title, path }) => (
              <NavLink key={title} href={path}>{title}</NavLink>
            ))}
          </Box>
        )}

        {/* ---------- right: wallet button or hamburger ---------- */}
        {isMobile ? (
          <>
            <IconButton onClick={() => setOpen(true)} sx={{ ml: "auto" }}>
              <FaBars size={24} color={theme.palette.text.primary} />
            </IconButton>
            <Drawer anchor="right" open={open}
                    onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }}>
              {drawer}
            </Drawer>
          </>
        ) : (
          <WalletButton
            address={address}
            owner={owner}
            connect={connect}
            disconnect={disconnect}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
