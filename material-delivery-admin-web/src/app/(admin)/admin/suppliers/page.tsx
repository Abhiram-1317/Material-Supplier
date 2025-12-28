"use client";

import {useEffect, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {createSupplier, fetchSuppliers, type AdminSupplier} from '@/api/admin';

const cityOptions = [
  {id: 1, name: 'Warangal'},
  {id: 2, name: 'Hanumakonda'},
];

type FormState = {
  companyName: string;
  email: string;
  password: string;
  phone: string;
  cityId: number;
  address: string;
  gstNumber: string;
};

const initialForm: FormState = {
  companyName: '',
  email: '',
  password: '',
  phone: '',
  cityId: 1,
  address: '',
  gstNumber: '',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSuppliers({pageSize: 100});
      setSuppliers(res.items);
    } catch (err) {
      console.error(err);
      setError('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await createSupplier({
        companyName: form.companyName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        cityId: Number(form.cityId),
        address: form.address,
        gstNumber: form.gstNumber || undefined,
      });
      setDialogOpen(false);
      setForm(initialForm);
      await load();
    } catch (err) {
      console.error(err);
      setError('Failed to create supplier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" gutterBottom>
            Suppliers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage supplier onboarding, status, and cities served.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add Supplier
        </Button>
      </Box>

      <Paper variant="outlined" sx={{p: 2}}>
        <Typography variant="subtitle1" gutterBottom>
          Supplier roster
        </Typography>
        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box py={4} display="flex" justifyContent="center">
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No suppliers yet.</TableCell>
                </TableRow>
              ) : (
                suppliers.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.companyName}</TableCell>
                    <TableCell>{s.city?.name ?? '-'}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.user?.email ?? '-'}</TableCell>
                    <TableCell>{s.user?.phone ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Supplier</DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 2}}>
          <TextField
            label="Company Name"
            value={form.companyName}
            onChange={(e) => setForm({...form, companyName: e.target.value})}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            required
            fullWidth
            inputProps={{minLength: 6}}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
            required
            fullWidth
          />
          <TextField
            select
            label="City"
            value={form.cityId}
            onChange={(e) => setForm({...form, cityId: Number(e.target.value)})}
            required
            fullWidth
          >
            {cityOptions.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Address"
            value={form.address}
            onChange={(e) => setForm({...form, address: e.target.value})}
            required
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="GST Number (optional)"
            value={form.gstNumber}
            onChange={(e) => setForm({...form, gstNumber: e.target.value})}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 2}}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Create Supplier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
