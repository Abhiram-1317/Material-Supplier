"use client";

import {ReactNode, useEffect} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import {useAuth} from "@/context/AuthContext";

const navItems = [
  {label: "Browse", href: "/browse"},
  {label: "Orders", href: "/orders"},
  {label: "Cart", href: "/cart"},
  {label: "Profile", href: "/profile"},
  {label: "Help", href: "/help"},
];

export default function CustomerLayout({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const {isAuthenticated, loading, logout} = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{minHeight: "100vh", bgcolor: "background.default"}}>
      <CssBaseline />
      <AppBar position="sticky" color="default" elevation={1} sx={{borderBottom: 1, borderColor: "divider"}}>
        <Toolbar sx={{gap: 2}}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Material Delivery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customer • City: Warangal/Hanumakonda
          </Typography>
          <Box flexGrow={1} />
          <Button onClick={async () => {await logout(); router.push("/login");}} variant="outlined" size="small">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{py: 3}}>
        {children}
      </Container>

      <Box component="footer" sx={{borderTop: 1, borderColor: "divider", py: 2, bgcolor: "background.paper"}}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} alignItems="center">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} style={{textDecoration: "none"}}>
                  <Typography
                    variant="body2"
                    fontWeight={active ? 700 : 500}
                    color={active ? "primary.main" : "text.secondary"}
                  >
                    {item.label}
                  </Typography>
                </Link>
              );
            })}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
