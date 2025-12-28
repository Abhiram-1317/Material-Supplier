"use client";

import {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {fetchSupplierRatings, type SupplierOrderRating} from '@/api/supplierRatings';

export default function RatingsPage() {
  const [ratings, setRatings] = useState<SupplierOrderRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSupplierRatings();
        if (active) setRatings(data);
      } catch (e) {
        if (active) setError('Failed to load ratings');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredRatings = useMemo(() => {
    return ratings.filter((r) => {
      if (minStars !== null && r.rating < minStars) return false;
      if (search) {
        const term = search.toLowerCase();
        const customerName = r.customer?.user?.fullName?.toLowerCase() ?? '';
        const comment = r.comment?.toLowerCase() ?? '';
        const orderCode = r.order?.orderCode?.toLowerCase() ?? '';
        return customerName.includes(term) || comment.includes(term) || orderCode.includes(term);
      }
      return true;
    });
  }, [ratings, minStars, search]);

  const averageRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ratings & reviews
        </Typography>
        <Typography variant="body1" color="text.secondary">
          See feedback from your customers on delivered orders.
        </Typography>
      </Box>

      <Paper sx={{p: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap'}}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Average rating
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{mt: 0.5}}>
            <Typography variant="h4" fontWeight={700}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} precision={0.1} readOnly />
            <Chip label={`${ratings.length} ratings`} size="small" />
          </Stack>
        </Box>
        <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{flex: 1, justifyContent: 'flex-end'}}>
          <TextField
            label="Search"
            placeholder="Search by customer, order ID or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{minWidth: 260}}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Min stars
            </Typography>
            <Rating
              value={minStars ?? 0}
              precision={1}
              onChange={(_, value) => setMinStars(value ?? null)}
            />
            {minStars !== null && (
              <Chip label={`≥ ${minStars}★`} size="small" onDelete={() => setMinStars(null)} />
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{p: 2}}>
        {loading && (
          <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Stars</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRatings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No ratings yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {filteredRatings.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {r.order?.orderCode ?? r.orderId}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {r.order?.scheduledSlot}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {r.customer?.user?.fullName ?? 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Rating value={r.rating} precision={1} readOnly size="small" />
                      <Chip label={`${r.rating} ★`} size="small" />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{maxWidth: 320}}>
                    <Typography variant="body2" noWrap title={r.comment ?? ''}>
                      {r.comment || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {new Date(r.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
