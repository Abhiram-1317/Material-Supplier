"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
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
  createVehicle,
  fetchVehicles,
  updateVehicle,
  type ApiVehicle,
  type CreateVehiclePayload,
  type UpdateVehiclePayload,
  VehicleStatus,
  VehicleType,
} from '@/api/logistics';

type FormState = {
  registrationNumber: string;
  type: VehicleType | '';
  cityId: number | '';
  capacityTons: number | '';
  status: VehicleStatus;
  assignedDriverId?: string | null;
  notes?: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function statusChipProps(status: VehicleStatus): {label: string; color: 'success' | 'warning' | 'default'} {
  if (status === 'ACTIVE') return {label: 'Active', color: 'success'};
  if (status === 'IN_SERVICE') return {label: 'In service', color: 'warning'};
  return {label: 'Inactive', color: 'default'};
}

const defaultCities = [
  {id: 1, name: 'Warangal', code: 'WARANGAL'},
  {id: 2, name: 'Hanumakonda', code: 'HANUMAKONDA'},
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<ApiVehicle | null>(null);
  const [saving, setSaving] = useState(false);

  const [cityFilter, setCityFilter] = useState<string | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<FormState>({
    registrationNumber: '',
    type: '',
    cityId: '',
    capacityTons: '',
    status: VehicleStatus.ACTIVE,
    assignedDriverId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const cityOptions = useMemo(() => {
    const fromData = Array.from(
      new Map(vehicles.map((v) => [v.city.id, v.city])).values(),
    );
    return fromData.length > 0 ? fromData : defaultCities;
  }, [vehicles]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (err) {
      setError('Failed to load vehicles');
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
        const data = await fetchVehicles();
        if (active) setVehicles(data);
      } catch (err) {
        if (active) setError('Failed to load vehicles');
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
      registrationNumber: '',
      type: '',
      cityId: cityOptions[0]?.id ?? '',
      capacityTons: '',
      status: VehicleStatus.ACTIVE,
      assignedDriverId: '',
      notes: '',
    });
    setErrors({});
  }, [cityOptions]);

  const openAddDrawer = () => {
    setEditingVehicle(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEditDrawer = (vehicle: ApiVehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      cityId: vehicle.city.id,
      capacityTons: vehicle.capacityTons,
      status: vehicle.status,
      assignedDriverId: vehicle.assignedDriver?.id ?? '',
      notes: vehicle.notes ?? '',
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingVehicle(null);
    setErrors({});
  };

  const validate = useCallback((state: FormState) => {
    const nextErrors: FormErrors = {};
    if (!state.registrationNumber.trim()) nextErrors.registrationNumber = 'Registration is required';
    if (!state.type) nextErrors.type = 'Type is required';
    if (state.cityId === '' || Number(state.cityId) <= 0) nextErrors.cityId = 'City is required';
    if (state.capacityTons === '' || Number(state.capacityTons) <= 0) nextErrors.capacityTons = 'Must be greater than 0';
    return nextErrors;
  }, []);

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const basePayload = {
      type: form.type as VehicleType,
      capacityTons: Number(form.capacityTons),
      cityId: Number(form.cityId),
      status: form.status,
      notes: form.notes?.trim() || undefined,
      assignedDriverId: form.assignedDriverId === '' ? undefined : form.assignedDriverId ?? undefined,
    } satisfies UpdateVehiclePayload;

    setSaving(true);
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, basePayload);
      } else {
        const createPayload: CreateVehiclePayload = {
          registrationNumber: form.registrationNumber.trim(),
          ...basePayload,
        };
        await createVehicle(createPayload);
      }
      await load();
      closeDrawer();
    } catch (err) {
      setError('Unable to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const drawerTitle = useMemo(() => (editingVehicle ? 'Edit vehicle' : 'Add vehicle'), [editingVehicle]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (cityFilter !== 'ALL' && v.city.code !== cityFilter) return false;
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      if (search) {
        const term = search.toLowerCase();
        if (!v.registrationNumber.toLowerCase().includes(term) && !v.type.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [vehicles, cityFilter, statusFilter, search]);

  const toggleVehicleStatus = async (vehicle: ApiVehicle) => {
    const nextStatus = vehicle.status === VehicleStatus.ACTIVE ? VehicleStatus.INACTIVE : VehicleStatus.ACTIVE;
    setSaving(true);
    try {
      await updateVehicle(vehicle.id, {status: nextStatus});
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
          Factory vehicles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your own trucks and mixers for Warangal & Hanumakonda.
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

          <FormControl size="small" sx={{minWidth: 180}}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'ALL')}
            >
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value={VehicleStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={VehicleStatus.IN_SERVICE}>In service</MenuItem>
              <MenuItem value={VehicleStatus.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search by registration or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{flex: 1}}
          />

          <Box sx={{display: 'flex', justifyContent: 'flex-end', width: {xs: '100%', md: 'auto'}}}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDrawer} disabled={saving}>
              Add vehicle
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
        ) : filteredVehicles.length === 0 ? (
          <Box sx={{py: 6, textAlign: 'center'}}>
            <Typography variant="subtitle1" gutterBottom>
              No vehicles match these filters.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust filters or add a new vehicle.
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Registration number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Capacity (tons)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned driver</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const {label, color} = statusChipProps(vehicle.status);
                return (
                  <TableRow key={vehicle.id} hover>
                    <TableCell sx={{fontWeight: 600}}>{vehicle.registrationNumber}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>{vehicle.city.name}</TableCell>
                    <TableCell>{vehicle.capacityTons}</TableCell>
                    <TableCell>
                      <Chip size="small" label={label} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />
                    </TableCell>
                    <TableCell>{vehicle.assignedDriver?.name || 'Unassigned'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDrawer(vehicle)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={vehicle.status === VehicleStatus.ACTIVE ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => toggleVehicleStatus(vehicle)} disabled={saving}>
                          {vehicle.status === VehicleStatus.ACTIVE ? (
                            <ToggleOffIcon fontSize="small" />
                          ) : (
                            <ToggleOnIcon fontSize="small" />
                          )}
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
                {editingVehicle ? 'Update vehicle details' : 'Add a new vehicle to your fleet.'}
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <TextField
            label="Registration number"
            value={form.registrationNumber}
            onChange={(e) => setForm((prev) => ({...prev, registrationNumber: e.target.value}))}
            error={!!errors.registrationNumber}
            helperText={errors.registrationNumber}
            fullWidth
          />

          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm((prev) => ({...prev, type: e.target.value as VehicleType}))}
            >
              {Object.values(VehicleType).map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
            {errors.type && (
              <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                {errors.type}
              </Typography>
            )}
          </FormControl>

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
            label="Capacity (tons)"
            type="number"
            value={form.capacityTons}
            onChange={(e) =>
              setForm((prev) => ({...prev, capacityTons: e.target.value === '' ? '' : Number(e.target.value)}))
            }
            error={!!errors.capacityTons}
            helperText={errors.capacityTons}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm((prev) => ({...prev, status: e.target.value as VehicleStatus}))}
            >
              <MenuItem value={VehicleStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={VehicleStatus.IN_SERVICE}>In service</MenuItem>
              <MenuItem value={VehicleStatus.INACTIVE}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Assigned driver ID (optional)"
            value={form.assignedDriverId ?? ''}
            onChange={(e) => setForm((prev) => ({...prev, assignedDriverId: e.target.value}))}
            fullWidth
          />

          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({...prev, notes: e.target.value}))}
            fullWidth
            multiline
            minRows={2}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{pt: 1}}>
            <Button variant="text" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={saving}>
              {editingVehicle ? 'Save changes' : 'Create vehicle'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
