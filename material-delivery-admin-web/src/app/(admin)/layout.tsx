"use client";

import {ReactNode, useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
  AppBar,
  Avatar,
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
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import StarRateIcon from '@mui/icons-material/StarRate';

const drawerWidth = 260;

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {label: 'Dashboard', href: '/admin/dashboard', icon: <DashboardIcon />},
  {label: 'Suppliers', href: '/admin/suppliers', icon: <BusinessIcon />},
  {label: 'Orders', href: '/admin/orders', icon: <AssignmentIcon />},
  {label: 'Customers', href: '/admin/customers', icon: <PeopleIcon />},
  {label: 'Ratings', href: '/admin/ratings', icon: <StarRateIcon />},
  {label: 'Payouts', href: '/admin/payouts', icon: <AccountBalanceWalletIcon />},
  {label: 'Settings', href: '/admin/settings', icon: <SettingsIcon />},
];

export default function AdminLayout({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Box sx={{p: 2}}>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          Material Supply – Admin
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Warangal & Hanumakonda
        </Typography>
      </Box>
      <Divider />
      <List sx={{flex: 1}}>
        {navItems.map((item) => {
          const selected = pathname.startsWith(item.href);
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              sx={{borderRadius: 2, mx: 1, my: 0.5}}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon sx={{minWidth: 40, color: selected ? 'primary.main' : 'inherit'}}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{p: 2, display: 'flex', alignItems: 'center', gap: 1.5}}>
        <Avatar sx={{width: 36, height: 36}}>A</Avatar>
        <Box>
          <Typography variant="subtitle2">Admin User</Typography>
          <Typography variant="caption" color="text.secondary">
            Operator
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: {sm: `calc(100% - ${drawerWidth}px)`},
          ml: {sm: `${drawerWidth}px`},
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{mr: 2, display: {sm: 'none'}}}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{flexGrow: 1}}>
            Material Supply – Admin
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
            <Avatar sx={{width: 36, height: 36}}>A</Avatar>
            <Typography variant="body2" color="text.secondary">
              Admin User
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}>
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
          open
          sx={{
            display: {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid #E5E7EB',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: {xs: 2, md: 3},
          width: {sm: `calc(100% - ${drawerWidth}px)`},
          bgcolor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
