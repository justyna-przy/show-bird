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
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";
import { FaBars } from "react-icons/fa";
import { useWallet } from "@/hooks/useWallet";
import { useMemo } from "react";
import WalletButton from "@/components/WalletButton";

const NavLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "1.15rem",
  fontWeight: 600,
  textDecoration: "none",
  "&:hover": { color: theme.palette.primary.main },
}));

const Navbar = () => {
  // Hooks
  const theme = useTheme();
  const { isConnected, isVenue, isDoorman, isAttendee } = useWallet();

  // Local state
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  

  // Navigation links
  const baseLinks     = [
    { title: "Home",    path: "/"        },
    { title: "About",   path: "/about"   },
    { title: "Tickets", path: "/tickets" },
  ];
  const attendeeLinks = [
    { title: "Balance",  path: "/balance"  },
    { title: "Transfer", path: "/transfer" },
  ];
  const doormanLinks  = [{ title: "Doorman",   path: "/doorman"   }];
  const venueLinks    = [{ title: "Dashboard", path: "/dashboard" }];

  // final list of navlinks: computed once per render 
  const links = useMemo(() => {
    const out = [...baseLinks];
    if (!isConnected) return out; // hide protected pages
    if (isAttendee) out.push(...attendeeLinks);
    if (isDoorman)  out.push(...doormanLinks);
    if (isVenue)    out.push(...venueLinks);
    return out;
  }, [isConnected, isAttendee, isDoorman, isVenue]);

  // Mobile drawer
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
      <WalletButton />
    </Box>
  );

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: theme.palette.background.default, boxShadow: "none" }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <Image
            src="/images/logo3.png"
            alt="logo"
            width={50}
            height={50}
            style={{ transform: "scaleX(-1)" }}
          />
          <NavLink
            href="/"
            style={{
              fontFamily: "'Roca Two',sans-serif",
              fontSize: "2rem",
              marginLeft: 8,
            }}
          >
            ShowBird
          </NavLink>
        </Box>
        {!isMobile && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              gap: 3,
            }}
          >
            {links.map(({ title, path }) => (
              <NavLink key={title} href={path}>
                {title}
              </NavLink>
            ))}
          </Box>
        )}
        {isMobile ? (
          <>
            <IconButton onClick={() => setOpen(true)} sx={{ ml: "auto" }}>
              <FaBars size={24} color={theme.palette.text.primary} />
            </IconButton>
            <Drawer
              anchor="right"
              open={open}
              onClose={() => setOpen(false)}
              ModalProps={{ keepMounted: true }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <WalletButton />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
