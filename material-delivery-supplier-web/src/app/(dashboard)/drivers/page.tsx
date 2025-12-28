"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  type ChipProps,
  CircularProgress,
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CloseIcon from '@mui/icons-material/Close';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createDriver,
  fetchDrivers,
  updateDriver,
  type ApiDriver,
  type CreateDriverPayload,
  type UpdateDriverPayload,
  DriverStatus,
} from '@/api/logistics';

type FormState = {
  name: string;
  phone: string;
  cityId: number | '';
  licenseNumber: string;
  status: DriverStatus;
  assignedVehicleId?: string | null;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function driverStatusChip(status: DriverStatus): {label: string; color: ChipProps['color']} {
  return {
    label: status === DriverStatus.ACTIVE ? 'Active' : 'Inactive',
    color: status === DriverStatus.ACTIVE ? 'success' : 'default',
  };
}

const defaultCities = [
  {id: 1, name: 'Warangal', code: 'WARANGAL'},
  {id: 2, name: 'Hanumakonda', code: 'HANUMAKONDA'},
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<ApiDriver | null>(null);
  const [saving, setSaving] = useState(false);

  const [cityFilter, setCityFilter] = useState<string | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<DriverStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    cityId: '',
    licenseNumber: '',
    status: DriverStatus.ACTIVE,
    assignedVehicleId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const cityOptions = useMemo(() => {
    const fromData = Array.from(new Map(drivers.map((d) => [d.city.id, d.city])).values());
    return fromData.length > 0 ? fromData : defaultCities;
  }, [drivers]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDrivers();
        if (active) setDrivers(data);
      } catch (err) {
        if (active) setError('Failed to load drivers');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      phone: '',
      cityId: cityOptions[0]?.id ?? '',
      licenseNumber: '',
      status: DriverStatus.ACTIVE,
      assignedVehicleId: '',
    });
    setErrors({});
  }, [cityOptions]);

  const openAddDrawer = () => {
    setEditingDriver(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEditDrawer = (driver: ApiDriver) => {
    setEditingDriver(driver);
    setForm({
      name: driver.name,
      phone: driver.phone,
      cityId: driver.city.id,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      assignedVehicleId: driver.assignedVehicle?.id ?? '',
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingDriver(null);
    setErrors({});
  };

  const validate = useCallback((state: FormState) => {
    const nextErrors: FormErrors = {};
    if (!state.name.trim()) nextErrors.name = 'Name is required';
    if (!state.phone.trim()) nextErrors.phone = 'Phone is required';
    if (state.cityId === '' || Number(state.cityId) <= 0) nextErrors.cityId = 'City is required';
    if (!state.licenseNumber.trim()) nextErrors.licenseNumber = 'License number is required';
    return nextErrors;
  }, []);

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const basePayload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      cityId: Number(form.cityId),
      licenseNumber: form.licenseNumber.trim(),
      status: form.status,
      assignedVehicleId: form.assignedVehicleId === '' ? undefined : form.assignedVehicleId ?? undefined,
    } satisfies UpdateDriverPayload;

    setSaving(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, basePayload);
      } else {
        const createPayload: CreateDriverPayload = basePayload as CreateDriverPayload;
        await createDriver(createPayload);
      }
      await load();
      closeDrawer();
    } catch (err) {
      setError('Unable to save driver');
    } finally {
      setSaving(false);
    }
  };

  const drawerTitle = useMemo(() => (editingDriver ? 'Edit driver' : 'Add driver'), [editingDriver]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (cityFilter !== 'ALL' && d.city.code !== cityFilter) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        if (
          !d.name.toLowerCase().includes(term) &&
          !d.phone.toLowerCase().includes(term) &&
          !d.licenseNumber.toLowerCase().includes(term)
        )
          return false;
      }
      return true;
    });
  }, [drivers, cityFilter, statusFilter, search]);

  const toggleDriverStatus = async (driver: ApiDriver) => {
    const nextStatus = driver.status === DriverStatus.ACTIVE ? DriverStatus.INACTIVE : DriverStatus.ACTIVE;
    setSaving(true);
    try {
      await updateDriver(driver.id, {status: nextStatus});
      await load();
    } catch (err) {
      setError('Unable to update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Drivers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage drivers operating your factory vehicles.
        </Typography>
      </Box>

      <Paper sx={{p: 2}}>
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems={{xs: 'stretch', md: 'center'}}>
          <FormControl size="small" sx={{minWidth: 150}}>
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value as string | 'ALL')}
            >
              <MenuItem value="ALL">All cities</MenuItem>
              {cityOptions.map((city) => (
                <MenuItem key={city.id} value={city.code}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DriverStatus | 'ALL')}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value={DriverStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={DriverStatus.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search by name, phone or license…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{flex: 1}}
          />

          <Box sx={{display: 'flex', justifyContent: 'flex-end', width: {xs: '100%', md: 'auto'}}}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDrawer} disabled={saving}>
              Add driver
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{p: 2}}>
        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{py: 6, display: 'flex', justifyContent: 'center'}}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredDrivers.length === 0 ? (
          <Box sx={{py: 6, textAlign: 'center'}}>
            <Typography variant="subtitle1" gutterBottom>
              No drivers match these filters.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust filters or add a new driver.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell>License no.</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned vehicle</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const {label, color} = driverStatusChip(driver.status);
                return (
                  <TableRow key={driver.id} hover>
                    <TableCell sx={{fontWeight: 600}}>{driver.name}</TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.city.name}</TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>
                      <Chip size="small" label={label} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />
                    </TableCell>
                    <TableCell>{driver.assignedVehicle?.registrationNumber || 'Unassigned'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDrawer(driver)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={driver.status === DriverStatus.ACTIVE ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => toggleDriverStatus(driver)} disabled={saving}>
                          {driver.status === DriverStatus.ACTIVE ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
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
        <Box sx={{width: 420, maxWidth: '100vw', p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">{drawerTitle}</Typography>
              <Typography variant="body2" color="text.secondary">
                {editingDriver ? 'Update driver details' : 'Add a new driver.'}
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />

          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({...prev, phone: e.target.value}))}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
          />

          <FormControl fullWidth error={!!errors.cityId}>
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              value={form.cityId}
              onChange={(e) => setForm((prev) => ({...prev, cityId: Number(e.target.value)}))}
            >
              {cityOptions.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
            {errors.cityId && (
              <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                {errors.cityId}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="License number"
            value={form.licenseNumber}
            onChange={(e) => setForm((prev) => ({...prev, licenseNumber: e.target.value}))}
            error={!!errors.licenseNumber}
            helperText={errors.licenseNumber}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({...prev, status: e.target.value as DriverStatus}))}
            >
              <MenuItem value={DriverStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={DriverStatus.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Assigned vehicle ID (optional)"
            value={form.assignedVehicleId ?? ''}
            onChange={(e) => setForm((prev) => ({...prev, assignedVehicleId: e.target.value}))}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{pt: 1}}>
            <Button variant="text" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {editingDriver ? 'Save changes' : 'Create driver'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
