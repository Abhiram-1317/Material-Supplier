"use client";

import {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import {fetchOrders, type AdminOrder} from '@/api/admin';

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchOrders({page: page + 1, pageSize});
        if (!active) return;
        setOrders(res.items);
        setTotal(res.total);
      } catch (e) {
        if (active) setError('Failed to load orders');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [page, pageSize]);

  const {deliveredCount, onTimeCount, lateCount, onTimeRate} = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'DELIVERED');
    const onTime = delivered.filter((o) => o.slaStatus === 'ON_TIME');
    const late = delivered.filter((o) => o.slaStatus === 'LATE');
    const rate = delivered.length ? Math.round((onTime.length / delivered.length) * 100) : 0;
    return {
      deliveredCount: delivered.length,
      onTimeCount: onTime.length,
      lateCount: late.length,
      onTimeRate: rate,
    };
  }, [orders]);

  const renderSlaChip = (order: AdminOrder) => {
    if (order.status !== 'DELIVERED' || !order.slaStatus || order.slaStatus === 'NOT_APPLICABLE') {
      return <Chip label="N/A" size="small" variant="outlined" />;
    }
    if (order.slaStatus === 'ON_TIME') {
      return <Chip label="On time" size="small" color="success" />;
    }
    return <Chip label="Late" size="small" color="error" />;
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Admins can view and manage orders across all suppliers and cities.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{p: 2}}>
        <Typography variant="subtitle1" gutterBottom>
          SLA performance
        </Typography>
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
          <Stat label="Delivered" value={deliveredCount} helper="Total delivered" />
          <Stat label="On time" value={onTimeCount} helper={`${onTimeRate}% on-time`} highlight />
          <Stat label="Late" value={lateCount} helper="Breach of SLA" />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{p: 2}}>
        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}

        <Box sx={{position: 'relative'}}>
          {loading && (
            <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!loading && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>SLA</TableCell>
                  <TableCell>Delivered at</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No orders found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{whiteSpace: 'nowrap'}}>{order.orderCode}</TableCell>
                    <TableCell>{order.supplier?.companyName ?? '—'}</TableCell>
                    <TableCell>{order.customer?.user?.fullName ?? order.customer?.companyName ?? '—'}</TableCell>
                    <TableCell>{order.site?.city?.name ?? '—'}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{renderSlaChip(order)}</TableCell>
                    <TableCell sx={{whiteSpace: 'nowrap'}}>
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      ₹ {Number(order.totalAmount).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPage(0);
            setPageSize(parseInt(e.target.value, 10));
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Stack>
  );
}

function Stat({
  label,
  value,
  helper,
  highlight,
}: {
  label: string;
  value: number;
  helper?: string;
  highlight?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{p: 2, flex: 1, bgcolor: highlight ? 'success.light' : 'background.paper'}}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{mt: 0.5}}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      ) : null}
    </Paper>
  );
}
