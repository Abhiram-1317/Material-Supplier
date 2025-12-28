"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FastForwardIcon from '@mui/icons-material/FastForward';
import CloseIcon from '@mui/icons-material/Close';
import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import type {City} from '@/data/products';
import {OrderStatus, SupplierOrder} from '@/data/orders';
import {useSupplierOrders} from '@/hooks/useSupplierOrders';

const cities: Array<City | 'ALL'> = ['ALL', 'Warangal', 'Hanumakonda'];
const statuses: Array<OrderStatus | 'ALL'> = ['ALL', 'PLACED', 'ACCEPTED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'PLACED':
      return {bgcolor: 'rgba(59,130,246,0.12)', color: '#1D4ED8'};
    case 'ACCEPTED':
      return {bgcolor: 'rgba(124,58,237,0.12)', color: '#6D28D9'};
    case 'DISPATCHED':
      return {bgcolor: 'rgba(249,115,22,0.12)', color: '#C2410C'};
    case 'DELIVERED':
      return {bgcolor: 'rgba(34,197,94,0.14)', color: '#15803D'};
    case 'CANCELLED':
    default:
      return {bgcolor: 'rgba(239,68,68,0.12)', color: '#B91C1C'};
  }
}

function OrderStatusChip({status}: {status: OrderStatus}) {
  const label =
    status === 'PLACED'
      ? 'Placed'
      : status === 'ACCEPTED'
        ? 'Accepted'
        : status === 'DISPATCHED'
          ? 'Dispatched'
          : status === 'DELIVERED'
            ? 'Delivered'
            : 'Cancelled';

  const colors = getStatusColor(status);

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        fontWeight: 600,
        borderRadius: 1,
        bgcolor: colors.bgcolor,
        color: colors.color,
      }}
    />
  );
}

function formatDate(ts: string) {
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'});
  const time = d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  return `${date}, ${time}`;
}

function nextStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PLACED':
      return 'Mark as accepted';
    case 'ACCEPTED':
      return 'Mark as dispatched';
    case 'DISPATCHED':
      return 'Mark as delivered';
    default:
      return 'No further steps';
  }
}

export default function OrdersPage() {
  const {filteredOrders, filters, updateFilters, advanceOrderStatus} = useSupplierOrders();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);

  const openDrawer = (order: SupplierOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const subtotal = useMemo(() => {
    if (!selectedOrder) return 0;
    return selectedOrder.items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  }, [selectedOrder]);

  const deliveryCharge = 250;
  const taxAmount = Math.round(subtotal * 0.18);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage incoming orders for Warangal & Hanumakonda plants.
        </Typography>
      </Box>

      <Paper sx={{p: 2}}>
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems={{xs: 'stretch', md: 'center'}}>
          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              value={filters.city ?? 'ALL'}
              onChange={(e) => updateFilters({city: e.target.value as City | 'ALL'})}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city === 'ALL' ? 'All cities' : city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{minWidth: 180}}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status ?? 'ALL'}
              onChange={(e) => updateFilters({status: e.target.value as OrderStatus | 'ALL'})}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status === 'ALL'
                    ? 'All statuses'
                    : status === 'PLACED'
                      ? 'Placed'
                      : status === 'ACCEPTED'
                        ? 'Accepted'
                        : status === 'DISPATCHED'
                          ? 'Dispatched'
                          : status === 'DELIVERED'
                            ? 'Delivered'
                            : 'Cancelled'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search by Order ID, site or customer…"
            value={filters.search ?? ''}
            onChange={(e) => updateFilters({search: e.target.value})}
            sx={{flex: 1}}
          />

          <Button
            variant="text"
            onClick={() => updateFilters({city: 'ALL', status: 'ALL', search: ''})}
            sx={{whiteSpace: 'nowrap'}}
          >
            Reset filters
          </Button>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          boxShadow: '0 2px 14px rgba(15,23,42,0.08)',
          border: '1px solid rgba(226,232,240,0.8)',
        }}
      >
        {filteredOrders.length === 0 ? (
          <Box sx={{py: 6, textAlign: 'center'}}>
            <Typography variant="subtitle1" gutterBottom>
              No orders match these filters.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try changing city, status or search.
            </Typography>
          </Box>
        ) : (
          <Table
            size="small"
            sx={{
              '& th': {
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                color: 'text.secondary',
                bgcolor: 'grey.50',
                borderBottom: '1px solid #E5E7EB',
              },
              '& td': {
                borderBottom: '1px solid #F3F4F6',
              },
              '& tbody tr:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Site / City</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Delivery slot</TableCell>
                <TableCell>Total (₹)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const disableAdvance = order.status === 'DELIVERED' || order.status === 'CANCELLED';
                return (
                  <TableRow key={order.id} hover>
                    <TableCell sx={{fontWeight: 600}}>{order.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{fontWeight: 600}}>
                        {order.siteLabel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.city}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.deliverySlot}</TableCell>
                    <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => openDrawer(order)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={nextStatusLabel(order.status)}>
                        <span>
                          <IconButton
                            size="small"
                            disabled={disableAdvance}
                            onClick={() => advanceOrderStatus(order.id)}
                            sx={{border: '1px solid #E2E8F0', borderRadius: 1}}
                          >
                            <FastForwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Track order">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/orders/${order.id}/track`)}
                          sx={{border: '1px solid #E2E8F0', borderRadius: 1, ml: 0.5}}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
        <Box sx={{width: 460, maxWidth: '100vw', p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">{selectedOrder?.id ?? 'Order'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedOrder?.city}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {selectedOrder ? <OrderStatusChip status={selectedOrder.status} /> : null}
              <IconButton onClick={closeDrawer}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Divider />

          {selectedOrder ? (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1">Customer & site</Typography>
                <Typography variant="body2" sx={{fontWeight: 600}}>
                  {selectedOrder.customerName}
                </Typography>
                <Typography variant="body2">{selectedOrder.siteLabel}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.addressLine}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.contactPhone}
                </Typography>
                <Typography variant="body2" sx={{mt: 0.5}}>
                  Delivery slot: {selectedOrder.deliverySlot}
                </Typography>
                <Typography variant="body2">Payment: {selectedOrder.paymentMethod}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Status timeline
                </Typography>
                <StatusTimeline current={selectedOrder.status} />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Items
                </Typography>
                <Stack spacing={1.25}>
                  {selectedOrder.items.map((item) => {
                    const lineTotal = item.quantity * item.pricePerUnit;
                    return (
                      <Box key={item.id} sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Box>
                          <Typography variant="body2" sx={{fontWeight: 600}}>
                            {item.materialName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.category} · {item.quantity} {item.unit}
                          </Typography>
                        </Box>
                        <Typography variant="body2">₹{lineTotal.toLocaleString('en-IN')}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Amounts
                </Typography>
                <Stack spacing={0.5}>
                  <AmountRow label="Subtotal" value={subtotal} />
                  <AmountRow label="Delivery charge" value={deliveryCharge} />
                  <AmountRow label="Tax (18%)" value={taxAmount} />
                  <Divider sx={{my: 1}} />
                  <AmountRow label="Total (calc)" value={subtotal + deliveryCharge + taxAmount} strong />
                  <Typography variant="caption" color="text.secondary">
                    Total billed: ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                  </Typography>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{pt: 1}}>
                <Button variant="text" onClick={closeDrawer}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={() => selectedOrder && advanceOrderStatus(selectedOrder.id)}
                  disabled={selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED'}
                >
                  {nextStatusLabel(selectedOrder.status)}
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Box>
      </Drawer>
    </Stack>
  );
}

function AmountRow({label, value, strong}: {label: string; value: number; strong?: boolean}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
      <Typography variant="body2" sx={{fontWeight: strong ? 700 : 400}}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{fontWeight: strong ? 700 : 400}}>
        ₹{value.toLocaleString('en-IN')}
      </Typography>
    </Box>
  );
}

function StatusTimeline({current}: {current: OrderStatus}) {
  const steps: OrderStatus[] = ['PLACED', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'];
  return (
    <Stack spacing={1.5} sx={{position: 'relative'}}>
      {steps.map((step, idx) => {
        const active = steps.indexOf(current) >= idx;
        return (
          <Box key={step} sx={{display: 'flex', gap: 1.5}}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: active ? 'primary.main' : 'grey.400',
                  mt: 0.5,
                }}
              />
              {idx < steps.length - 1 ? (
                <Box sx={{flex: 1, width: 2, bgcolor: active ? 'primary.main' : 'grey.300', minHeight: 28}} />
              ) : null}
            </Box>
            <Typography variant="body2" sx={{fontWeight: active ? 700 : 400, color: active ? 'text.primary' : 'text.secondary'}}>
              {step === 'PLACED'
                ? 'Placed'
                : step === 'ACCEPTED'
                  ? 'Accepted'
                  : step === 'DISPATCHED'
                    ? 'Dispatched'
                    : 'Delivered'}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}
