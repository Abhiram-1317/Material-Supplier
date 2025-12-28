"use client";

import {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Rating,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {fetchRatings, type AdminRating} from '@/api/admin';

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<AdminRating[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // zero-based for MUI
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState<number | 'ALL'>('ALL');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchRatings({
          search: search || undefined,
          rating: minStars === 'ALL' ? undefined : minStars,
          page: page + 1,
          pageSize,
        });
        if (!active) return;
        setRatings(res.items);
        setTotal(res.total);
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
  }, [page, pageSize, search, minStars]);

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [ratings]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Ratings & reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor customer feedback across suppliers and orders.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{p: 2, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center'}}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Average rating
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 0.5}}>
            <Typography variant="h4" fontWeight={700}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} precision={0.1} readOnly />
            <Chip label={`${total} ratings`} size="small" />
          </Stack>
        </Box>

        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} sx={{flex: 1, justifyContent: 'flex-end'}}>
          <TextField
            label="Search"
            placeholder="Search by supplier, order ID or comment…"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            size="small"
            sx={{minWidth: 260}}
          />

          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel id="min-rating-label">Min rating</InputLabel>
            <Select
              labelId="min-rating-label"
              label="Min rating"
              value={minStars}
              onChange={(e) => {
                setPage(0);
                const value = e.target.value;
                setMinStars(value === 'ALL' ? 'ALL' : Number(value));
              }}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value={1}>1+</MenuItem>
              <MenuItem value={2}>2+</MenuItem>
              <MenuItem value={3}>3+</MenuItem>
              <MenuItem value={4}>4+</MenuItem>
              <MenuItem value={5}>5</MenuItem>
            </Select>
          </FormControl>
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
                  <TableCell>Supplier</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No ratings found for this filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {ratings.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.supplier?.companyName ?? 'Unknown supplier'}</TableCell>
                    <TableCell>{r.order?.orderCode ?? r.orderId}</TableCell>
                    <TableCell>{r.customer?.user?.fullName ?? 'Unknown customer'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={r.rating} precision={1} readOnly size="small" />
                        <Chip label={`${r.rating} ★`} size="small" />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{maxWidth: 300}}>
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
