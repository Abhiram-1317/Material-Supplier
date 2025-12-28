"use client";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import {useMemo, useState} from 'react';
import type {City} from '@/data/products';
import type {DeliverySlot} from '@/data/supplierProfile';
import {DEFAULT_SUPPLIER_SETTINGS} from '@/data/supplierProfile';
import {useSupplierSettings} from '@/hooks/useSupplierSettings';

type ProfileFormState = {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  gstNumber: string;
};

type SlotFormState = {
  id?: string;
  city: City;
  label: string;
  startTime: string;
  endTime: string;
  active: boolean;
};

type ProfileErrors = Partial<Record<keyof ProfileFormState, string>>;

export default function SettingsPage() {
  const {
    settings,
    updateBusinessProfile,
    updateServedCities,
    updateDefaultCity,
    upsertDeliverySlot,
    deleteDeliverySlot,
    updateNotifications,
  } = useSupplierSettings();

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    companyName: DEFAULT_SUPPLIER_SETTINGS.businessProfile.companyName,
    contactName: DEFAULT_SUPPLIER_SETTINGS.businessProfile.contactName,
    contactPhone: DEFAULT_SUPPLIER_SETTINGS.businessProfile.contactPhone,
    contactEmail: DEFAULT_SUPPLIER_SETTINGS.businessProfile.contactEmail ?? '',
    gstNumber: DEFAULT_SUPPLIER_SETTINGS.businessProfile.gstNumber ?? '',
  });
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSaved, setProfileSaved] = useState(false);

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);
  const [slotForm, setSlotForm] = useState<SlotFormState>({
    city: settings.defaultCity,
    label: '',
    startTime: '08:00',
    endTime: '11:00',
    active: true,
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync profile form when settings change (e.g., loaded from storage)
  useMemo(() => {
    setProfileForm({
      companyName: settings.businessProfile.companyName,
      contactName: settings.businessProfile.contactName,
      contactPhone: settings.businessProfile.contactPhone,
      contactEmail: settings.businessProfile.contactEmail ?? '',
      gstNumber: settings.businessProfile.gstNumber ?? '',
    });
  }, [settings.businessProfile]);

  const servedCities = settings.servedCities;

  const handleProfileSave = () => {
    const errs: ProfileErrors = {};
    if (!profileForm.companyName.trim()) errs.companyName = 'Company name is required';
    if (!profileForm.contactName.trim()) errs.contactName = 'Contact name is required';
    if (!profileForm.contactPhone.trim()) errs.contactPhone = 'Contact phone is required';
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    updateBusinessProfile({
      companyName: profileForm.companyName.trim(),
      contactName: profileForm.contactName.trim(),
      contactPhone: profileForm.contactPhone.trim(),
      contactEmail: profileForm.contactEmail.trim() || undefined,
      gstNumber: profileForm.gstNumber.trim() || undefined,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1800);
  };

  const toggleCity = (city: City) => {
    const next = servedCities.includes(city)
      ? servedCities.filter((c) => c !== city)
      : [...servedCities, city];
    updateServedCities(next);
  };

  const openAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({
      city: settings.defaultCity,
      label: '',
      startTime: '08:00',
      endTime: '11:00',
      active: true,
    });
    setSlotDialogOpen(true);
  };

  const openEditSlot = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setSlotForm({
      id: slot.id,
      city: slot.city,
      label: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      active: slot.active,
    });
    setSlotDialogOpen(true);
  };

  const handleSlotSave = () => {
    if (!slotForm.label.trim()) return;
    if (!slotForm.startTime || !slotForm.endTime) return;
    upsertDeliverySlot({
      id: slotForm.id,
      city: slotForm.city,
      label: slotForm.label.trim(),
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      active: slotForm.active,
    });
    setSlotDialogOpen(false);
    setEditingSlot(null);
  };

  const handleDeleteSlot = () => {
    if (confirmDeleteId) deleteDeliverySlot(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const slotDialogTitle = editingSlot ? 'Edit delivery slot' : 'Add delivery slot';

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure your business profile, service cities, delivery slots, and notifications.
        </Typography>
      </Box>

      {/* Business profile */}
      <Paper sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Box>
          <Typography variant="h6">Business profile</Typography>
          <Typography variant="body2" color="text.secondary">
            Company details used on invoices and for communication.
          </Typography>
        </Box>
        <Stack spacing={2}>
          <TextField
            label="Company name"
            value={profileForm.companyName}
            onChange={(e) => setProfileForm((prev) => ({...prev, companyName: e.target.value}))}
            error={!!profileErrors.companyName}
            helperText={profileErrors.companyName}
            required
          />
          <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
            <TextField
              label="Contact name"
              value={profileForm.contactName}
              onChange={(e) => setProfileForm((prev) => ({...prev, contactName: e.target.value}))}
              error={!!profileErrors.contactName}
              helperText={profileErrors.contactName}
              required
              fullWidth
            />
            <TextField
              label="Contact phone"
              value={profileForm.contactPhone}
              onChange={(e) => setProfileForm((prev) => ({...prev, contactPhone: e.target.value}))}
              error={!!profileErrors.contactPhone}
              helperText={profileErrors.contactPhone}
              required
              fullWidth
            />
          </Stack>
          <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
            <TextField
              label="Contact email"
              value={profileForm.contactEmail}
              onChange={(e) => setProfileForm((prev) => ({...prev, contactEmail: e.target.value}))}
              fullWidth
            />
            <TextField
              label="GST number"
              value={profileForm.gstNumber}
              onChange={(e) => setProfileForm((prev) => ({...prev, gstNumber: e.target.value}))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" onClick={handleProfileSave}>
              Save changes
            </Button>
            {profileSaved && (
              <Typography variant="body2" color="success.main">
                Saved
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Service cities and slots */}
      <Paper sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Box>
          <Typography variant="h6">Service areas & delivery slots</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose cities you serve and configure delivery windows per city.
          </Typography>
        </Box>

        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems={{xs: 'flex-start', md: 'center'}}>
          <Stack direction="row" spacing={1}>
            {(['Warangal', 'Hanumakonda'] as City[]).map((city) => {
              const selected = servedCities.includes(city);
              return (
                <Chip
                  key={city}
                  label={city}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => toggleCity(city)}
                />
              );
            })}
          </Stack>

          <FormControl size="small" sx={{minWidth: 200}}>
            <InputLabel>Default city</InputLabel>
            <Select
              label="Default city"
              value={settings.defaultCity}
              onChange={(e) => updateDefaultCity(e.target.value as City)}
            >
              {servedCities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Delivery slots</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={openAddSlot}>
            Add slot
          </Button>
        </Stack>

        {settings.deliverySlots.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No delivery slots configured yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {settings.deliverySlots.map((slot) => (
              <Paper key={slot.id} variant="outlined" sx={{p: 1.5}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                  <Box sx={{flex: 1}}>
                    <Typography variant="subtitle2">{slot.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {slot.startTime}–{slot.endTime}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{mt: 0.5}}>
                      <Chip label={slot.city} size="small" variant="outlined" />
                      <Chip
                        label={slot.active ? 'Active' : 'Inactive'}
                        size="small"
                        color={slot.active ? 'success' : 'default'}
                        variant={slot.active ? 'filled' : 'outlined'}
                      />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit slot">
                      <IconButton size="small" onClick={() => openEditSlot(slot)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete slot">
                      <IconButton size="small" onClick={() => setConfirmDeleteId(slot.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Notifications */}
      <Paper sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 2}}>
        <Box>
          <Typography variant="h6">Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Control alerts for orders and operations.
          </Typography>
        </Box>
        <Stack spacing={1}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.orderUpdates}
                onChange={(e) => updateNotifications({orderUpdates: e.target.checked})}
              />
            }
            label="Order updates"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.criticalAlerts}
                onChange={(e) => updateNotifications({criticalAlerts: e.target.checked})}
              />
            }
            label="Critical alerts"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifications.marketing}
                onChange={(e) => updateNotifications({marketing: e.target.checked})}
              />
            }
            label="Marketing updates"
          />
        </Stack>
      </Paper>

      {/* Slot dialog */}
      <Dialog open={slotDialogOpen} onClose={() => setSlotDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{slotDialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{mt: 1}}>
            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                label="City"
                value={slotForm.city}
                onChange={(e) => setSlotForm((prev) => ({...prev, city: e.target.value as City}))}
              >
                {(['Warangal', 'Hanumakonda'] as City[]).map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Label"
              value={slotForm.label}
              onChange={(e) => setSlotForm((prev) => ({...prev, label: e.target.value}))}
              placeholder="Morning 8–11 AM"
              fullWidth
            />

            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
              <TextField
                label="Start time"
                type="time"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm((prev) => ({...prev, startTime: e.target.value}))}
                fullWidth
                InputLabelProps={{shrink: true}}
              />
              <TextField
                label="End time"
                type="time"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm((prev) => ({...prev, endTime: e.target.value}))}
                fullWidth
                InputLabelProps={{shrink: true}}
              />
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={slotForm.active}
                  onChange={(e) => setSlotForm((prev) => ({...prev, active: e.target.checked}))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSlotSave} variant="contained">
            {editingSlot ? 'Save slot' : 'Add slot'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete delivery slot</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">Are you sure you want to delete this slot?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteSlot}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
