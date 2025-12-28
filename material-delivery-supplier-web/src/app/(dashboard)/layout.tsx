"use client";

import {Menu as MenuIcon} from '@mui/icons-material';
import {
  AppBar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import StarRateIcon from '@mui/icons-material/StarRate';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {useRouter} from 'next/navigation';
import {useSupplierAuth} from '@/context/SupplierAuthContext';
import {fetchNotifications} from '@/api/notifications';

const drawerWidth = 240;

const navItems = [
  {label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon />},
  {label: 'Orders', href: '/orders', icon: <AssignmentIcon />},
  {label: 'Notifications', href: '/notifications', icon: <NotificationsIcon fontSize="small" />},
  {label: 'Products', href: '/products', icon: <Inventory2Icon />},
  {label: 'Slots & capacity', href: '/slots', icon: <AccessTimeIcon fontSize="small" />},
  {label: 'Vehicles', href: '/vehicles', icon: <LocalShippingIcon />},
  {label: 'Drivers', href: '/drivers', icon: <PeopleAltIcon />},
  {label: 'Ratings', href: '/ratings', icon: <StarRateIcon />},
  {label: 'Settings', href: '/settings', icon: <SettingsIcon />},
];

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({children}: DashboardLayoutProps) {
  const {isAuthenticated, loading, user} = useSupplierAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousCountRef = useRef<number | null>(null);

  const playNotificationSound = async () => {
    try {
      const audio = new Audio('/notification.wav');
      await audio.play();
    } catch (err) {
      // Autoplay might be blocked until user interaction; ignore errors.
      console.warn('Notification sound blocked or failed to play:', err);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    const loadUnread = async () => {
      try {
        const data = await fetchNotifications();
        if (!active) return;
        const count = data.filter((n) => n.status !== 'READ').length;

        const prev = previousCountRef.current;
        if (prev !== null && count > prev) {
          void playNotificationSound();
        }

        previousCountRef.current = count;
        setUnreadCount(count);
      } catch {
        // ignore count fetch errors
      }
    };

    void loadUnread();
    const id = setInterval(loadUnread, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
        <Typography variant="body1">Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'}}>
        <Typography variant="body2">Redirecting to login…</Typography>
      </Box>
    );
  }

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Supplier Portal
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={!!active}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: {sm: `calc(100% - ${drawerWidth}px)`},
          ml: {sm: `${drawerWidth}px`},
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{mr: 2, display: {sm: 'none'}}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Supplier Portal
          </Typography>
          <Box sx={{flexGrow: 1}} />
          <Typography variant="body2" sx={{mr: 2}}>
            Hello, {user?.fullName || 'Supplier'}
          </Typography>
          <IconButton color="inherit" size="large" onClick={() => router.push('/notifications')}>
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{keepMounted: true}}
          sx={{
            display: {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {sm: `calc(100% - ${drawerWidth}px)`},
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
