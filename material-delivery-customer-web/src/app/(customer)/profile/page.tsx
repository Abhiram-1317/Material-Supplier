"use client";

import Link from "next/link";
import {List, ListItemButton, ListItemText, Paper, Typography} from "@mui/material";

export default function ProfilePage() {
  return (
    <Paper sx={{p: 2}}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Profile
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        Profile placeholder.
      </Typography>

      <List>
        <ListItemButton component={Link} href="/addresses">
          <ListItemText primary="Addresses" secondary="Manage your delivery sites" />
        </ListItemButton>
        <ListItemButton component={Link} href="/orders">
          <ListItemText primary="Orders" secondary="View your past orders" />
        </ListItemButton>
        <ListItemButton component={Link} href="/notifications">
          <ListItemText primary="Notifications" secondary="Order updates and alerts" />
        </ListItemButton>
        <ListItemButton component={Link} href="/help">
          <ListItemText primary="Help & support" secondary="Get assistance" />
        </ListItemButton>
      </List>
    </Paper>
  );
}
