"use client";

import {useEffect, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {fetchSupplierSlots, SupplierSlotConfig, upsertSupplierSlots} from '@/api/slots';

export default function SlotsPage() {
  const [slots, setSlots] = useState<SupplierSlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSupplierSlots();
        setSlots(data);
      } catch (e) {
        setError('Failed to load slot configurations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChangeMax = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? {...s, maxOrdersPerDay: Number.isNaN(num) ? 0 : num} : s)),
    );
  };

  const handleToggleActive = (id: string) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? {...s, isActive: !s.isActive} : s)));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      const updated = await upsertSupplierSlots(slots);
      setSlots(updated);
      setSuccessMsg('Slot capacities updated');
    } catch (e) {
      setError('Failed to save slot configurations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Slots &amp; capacity
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure how many orders you can handle per time slot each day.
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{mb: 2}}>
          {successMsg}
        </Alert>
      )}

      <Paper sx={{p: 2}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Slot</TableCell>
              <TableCell>Max orders / day</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell>{slot.label}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={slot.maxOrdersPerDay}
                    onChange={(e) => handleChangeMax(slot.id, e.target.value)}
                    inputProps={{min: 0}}
                    sx={{maxWidth: 140}}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={slot.isActive}
                    onChange={() => handleToggleActive(slot.id)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
