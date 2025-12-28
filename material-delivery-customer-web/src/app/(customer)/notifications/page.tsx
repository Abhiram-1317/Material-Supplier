"use client";

import {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {useRouter} from "next/navigation";
import {ApiNotification, fetchNotifications, markNotificationRead} from "@/api/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (e) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? {...n, status: "READ", readAt: new Date().toISOString()} : n)),
      );
    } catch {
      // ignore for now
    }
  };

  const unreadCount = notifications.filter((n) => n.status !== "READ").length;

  const handleClickNotification = (n: ApiNotification) => {
    if (n.orderId) {
      router.push(`/orders/${n.orderId}`);
    }
  };

  return (
    <Box>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsNoneIcon />
          <Typography variant="h5">Notifications</Typography>
          {unreadCount > 0 ? <Chip label={`${unreadCount} unread`} color="primary" size="small" sx={{ml: 1}} /> : null}
        </Box>
        <Typography variant="body2" color="primary" sx={{cursor: "pointer"}} onClick={handleRefresh}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No notifications yet.</Alert>
      ) : (
        <Paper>
          <List>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                disablePadding
                secondaryAction={
                  n.status !== "READ" ? (
                    <IconButton
                      edge="end"
                      aria-label="mark read"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleMarkRead(n.id);
                      }}
                    >
                      <DoneIcon />
                    </IconButton>
                  ) : null
                }
                sx={{opacity: n.status === "READ" ? 0.65 : 1}}
              >
                <ListItemButton onClick={() => handleClickNotification(n)}>
                  <ListItemText
                    primary={n.title}
                    secondary={`${new Date(n.createdAt).toLocaleString()} — ${n.body}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
