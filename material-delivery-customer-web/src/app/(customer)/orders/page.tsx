"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TableContainer,
} from "@mui/material";
import {fetchOrders, type ApiOrder} from "@/api/orders";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchOrders();
        setOrders(res);
      } catch (e) {
        console.error("fetchOrders error", e);
        setError("Unable to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Paper sx={{p: 3, textAlign: "center"}}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{p: 3}}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (orders.length === 0) {
    return (
      <Paper sx={{p: 3}}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          My orders
        </Typography>
        <Typography color="text.secondary">You have no orders yet.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{p: 2}}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        My orders
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Site</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                hover
                sx={{cursor: "pointer"}}
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <TableCell>{order.orderCode}</TableCell>
                <TableCell>{order.site?.label}</TableCell>
                <TableCell>{order.supplier?.companyName}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell align="right">₹{Number(order.totalAmount).toFixed(2)}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
