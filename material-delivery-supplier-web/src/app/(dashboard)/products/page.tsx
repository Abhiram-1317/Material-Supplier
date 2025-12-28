"use client";

import {
  Box,
  Button,
  Avatar,
  Chip,
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
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {uploadImageToCloudinary} from '@/lib/cloudinaryUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  createSupplierProduct,
  fetchSupplierProducts,
  updateSupplierProduct,
  type SupplierProduct,
  type Unit,
} from '@/api/supplier';
import {useSupplierAuth} from '@/context/SupplierAuthContext';

type FilterState = {
  city?: string | 'ALL';
  category?: string | 'ALL';
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  search?: string;
};

type AttributeState = Record<string, string | number | boolean>;
type BulkTierState = {minQty: number | ''; price: number | ''};

type FormState = {
  name: string;
  categorySlug: string;
  unit: Unit | '';
  basePrice: number | '';
  minOrderQty: number | '';
  leadTimeHours: number | '';
  imageUrl?: string;
  description?: string;
  attributes: AttributeState;
  bulkTiers: BulkTierState[];
  deliveryCharge: number | '';
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const cities = ['Warangal', 'Hanumakonda'];
const categories = [
  {label: 'Sand', slug: 'sand'},
  {label: 'Cement', slug: 'cement'},
  {label: 'Ready Mix Concrete', slug: 'rmc'},
  {label: 'Bricks', slug: 'bricks'},
  {label: 'Precast Wall', slug: 'precast-wall'},
  {label: 'Other', slug: 'other'},
];
const units: Unit[] = ['TON', 'M3', 'BAG', 'PIECE'];

const CATEGORY_FORM_CONFIG: Record<string, {fields: string[]; bulk: boolean}> = {
  bricks: {fields: ['type', 'size'], bulk: true},
  polls: {fields: ['type', 'size'], bulk: true},
  chairs: {fields: ['type', 'custom_name_option'], bulk: true},
  rings: {fields: ['type', 'size'], bulk: true},
};

export default function ProductsPage() {
  useSupplierAuth(); // ensures context is initialized

  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    categorySlug: categories[0].slug,
    unit: '',
    basePrice: '',
    minOrderQty: '',
    leadTimeHours: '',
    imageUrl: '',
    description: '',
    attributes: {},
    bulkTiers: [{minQty: '', price: ''}],
    deliveryCharge: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const categoryConfig = useMemo(
    () => CATEGORY_FORM_CONFIG[form.categorySlug] ?? {fields: [], bulk: false},
    [form.categorySlug],
  );

  const buildAttributesForCategory = useCallback(
    (slug: string, current?: AttributeState): AttributeState => {
      const cfg = CATEGORY_FORM_CONFIG[slug];
      if (!cfg) return {};
      const next: AttributeState = {};
      for (const field of cfg.fields) {
        if (field === 'custom_name_option') {
          next[field] = current?.[field] ?? false;
        } else {
          next[field] = (current?.[field] as string | number | boolean) ?? '';
        }
      }
      return next;
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupplierProducts();
      setProducts(data);
    } catch (err) {
      setError('Unable to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      attributes: buildAttributesForCategory(form.categorySlug, prev.attributes),
    }));
  }, [buildAttributesForCategory, form.categorySlug]);

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      categorySlug: categories[0].slug,
      unit: '',
      basePrice: '',
      minOrderQty: '',
      leadTimeHours: '',
      imageUrl: '',
      description: '',
      attributes: {},
      bulkTiers: [{minQty: '', price: ''}],
      deliveryCharge: '',
    });
    setErrors({});
  }, []);

  const openAddDrawer = () => {
    setEditingProduct(null);
    resetForm();
    setUploadError(null);
    setUploadingImage(false);
    setDrawerOpen(true);
  };

  const updateAttributeField = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({...prev, attributes: {...prev.attributes, [key]: value}}));
  };

  const updateBulkTier = (index: number, key: 'minQty' | 'price', value: number | '') => {
    setForm((prev) => {
      const next = [...prev.bulkTiers];
      next[index] = {...next[index], [key]: value};
      return {...prev, bulkTiers: next};
    });
  };

  const addBulkTier = () => {
    setForm((prev) => ({...prev, bulkTiers: [...prev.bulkTiers, {minQty: '', price: ''}]}));
  };

  const removeBulkTier = (index: number) => {
    setForm((prev) => ({...prev, bulkTiers: prev.bulkTiers.filter((_, i) => i !== index)}));
  };

  const openEditDrawer = (product: SupplierProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categorySlug: product.category.slug,
      unit: product.unit,
      basePrice: Number(product.basePrice),
      minOrderQty: Number(product.minOrderQty),
      leadTimeHours: product.leadTimeHours,
      imageUrl: product.imageUrl ?? '',
      description: '',
      attributes: buildAttributesForCategory(product.category.slug, product.attributes ?? undefined),
      bulkTiers:
        Array.isArray(product.bulkTiers) && product.bulkTiers.length > 0
          ? product.bulkTiers.map((tier) => ({minQty: Number(tier.minQty), price: Number(tier.price)}))
          : [{minQty: '', price: ''}],
      deliveryCharge: product.deliveryCharge === null || product.deliveryCharge === undefined ? '' : Number(product.deliveryCharge),
    });
    setUploadError(null);
    setUploadingImage(false);
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingProduct(null);
    setErrors({});
    setUploadError(null);
    setUploadingImage(false);
  };

  const validate = useCallback((state: FormState) => {
    const nextErrors: FormErrors = {};
    if (!state.name.trim()) nextErrors.name = 'Name is required';
    if (!state.categorySlug) nextErrors.categorySlug = 'Category is required';
    if (!state.unit) nextErrors.unit = 'Unit is required';
    if (state.basePrice === '' || Number(state.basePrice) <= 0) nextErrors.basePrice = 'Must be greater than 0';
    if (state.minOrderQty === '' || Number(state.minOrderQty) <= 0) nextErrors.minOrderQty = 'Must be greater than 0';
    if (state.leadTimeHours === '' || Number(state.leadTimeHours) < 0) nextErrors.leadTimeHours = 'Must be zero or more';
    return nextErrors;
  }, []);

  const handleSubmit = async () => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const normalizedBulkTiers = (form.bulkTiers || [])
      .filter((tier) => tier.minQty !== '' && tier.price !== '')
      .map((tier) => ({minQty: Number(tier.minQty), price: Number(tier.price)}));

    const payload = {
      name: form.name.trim(),
      categorySlug: form.categorySlug,
      unit: form.unit as Unit,
      basePrice: Number(form.basePrice),
      minOrderQty: Number(form.minOrderQty),
      leadTimeHours: Number(form.leadTimeHours),
      imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : undefined,
      description: form.description?.trim() || undefined,
      attributes:
        form.attributes && Object.keys(form.attributes).length > 0 ? form.attributes : undefined,
      bulkTiers: normalizedBulkTiers.length > 0 ? normalizedBulkTiers : undefined,
      deliveryCharge: form.deliveryCharge === '' ? undefined : Number(form.deliveryCharge),
    };

    try {
      if (editingProduct) {
        await updateSupplierProduct(editingProduct.id, payload);
      } else {
        await createSupplierProduct(payload);
      }
      await refresh();
      closeDrawer();
    } catch (err) {
      setError('Unable to save product');
    }
  };

  const toggleStatus = async (product: SupplierProduct) => {
    try {
      await updateSupplierProduct(product.id, {isActive: !product.isActive});
      await refresh();
    } catch (err) {
      setError('Unable to update status');
    }
  };

  const updateFilters = (partial: FilterState) => {
    setFilters((prev) => ({...prev, ...partial}));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.city && filters.city !== 'ALL' && p.city.name !== filters.city) return false;
      if (filters.category && filters.category !== 'ALL' && p.category.slug !== filters.category) return false;
      if (filters.status && filters.status !== 'ALL') {
        const status = p.isActive ? 'ACTIVE' : 'INACTIVE';
        if (status !== filters.status) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.category.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filters.category, filters.city, filters.search, filters.status, products]);

  const drawerTitle = useMemo(() => (editingProduct ? 'Edit material' : 'Add material'), [editingProduct]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Products & pricing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage materials, base prices, and minimum order quantities.
        </Typography>
      </Box>

      <Paper sx={{p: 2}}>
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems={{xs: 'stretch', md: 'center'}}>
          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              value={filters.city ?? 'ALL'}
              onChange={(e) => updateFilters({city: e.target.value as string | 'ALL'})}
            >
              <MenuItem value="ALL">All cities</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{minWidth: 200}}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={filters.category ?? 'ALL'}
              onChange={(e) => updateFilters({category: e.target.value as string | 'ALL'})}
            >
              <MenuItem value="ALL">All categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.slug} value={cat.slug}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.status ?? 'ALL'}
              onChange={(e) => updateFilters({status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'ALL'})}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search by material name…"
            value={filters.search ?? ''}
            onChange={(e) => updateFilters({search: e.target.value})}
            sx={{flex: 1}}
          />

          <Box sx={{flex: {xs: 'unset', md: '0 0 auto'}, display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDrawer}>
              Add material
            </Button>
          </Box>
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
        {error && (
          <Typography color="error" sx={{mb: 2}}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Typography sx={{py: 4, textAlign: 'center'}}>Loading...</Typography>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{py: 6, textAlign: 'center'}}>
            <Typography variant="subtitle1" gutterBottom>
              No materials found for this filter.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust filters or add a new material to get started.
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
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Base price (₹/unit)</TableCell>
                <TableCell>Min order</TableCell>
                <TableCell>Lead time (hrs)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Avatar
                      src={product.imageUrl || undefined}
                      variant="rounded"
                      sx={{width: 48, height: 48, borderRadius: 2}}
                    >
                      {!product.imageUrl && product.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description || product.category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.city.name}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700}>₹{Number(product.basePrice).toLocaleString('en-IN')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      per {product.unit.toLowerCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>{Number(product.minOrderQty).toLocaleString('en-IN')}</TableCell>
                  <TableCell>{product.leadTimeHours}</TableCell>
                  <TableCell>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: product.isActive ? '#22c55e' : '#cbd5e1',
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} color={product.isActive ? 'success.main' : 'text.secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="edit" onClick={() => openEditDrawer(product)} size="small" sx={{border: '1px solid #E2E8F0', borderRadius: 1, mr: 0.5}}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={product.isActive ? 'deactivate' : 'activate'}
                      onClick={() => toggleStatus(product)}
                      size="small"
                      sx={{border: '1px solid #E2E8F0', borderRadius: 1}}
                    >
                      {product.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
                {editingProduct ? 'Update material details' : 'Add a new material with base pricing.'}
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

          <FormControl fullWidth error={!!errors.categorySlug}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={form.categorySlug}
              onChange={(e) => setForm((prev) => ({...prev, categorySlug: e.target.value as string}))}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.slug} value={cat.slug}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
            {errors.categorySlug && (
              <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                {errors.categorySlug}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.unit}>
            <InputLabel>Unit</InputLabel>
            <Select
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm((prev) => ({...prev, unit: e.target.value as Unit}))}
            >
              {units.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
            {errors.unit && (
              <Typography variant="caption" color="error" sx={{mt: 0.5}}>
                {errors.unit}
              </Typography>
            )}
          </FormControl>

          {categoryConfig.fields.length > 0 && (
            <Box sx={{p: 2, border: '1px solid #E5E7EB', borderRadius: 2}}>
              <Typography variant="subtitle2" gutterBottom>
                Specifications
              </Typography>
              <Stack spacing={2}>
                {categoryConfig.fields.includes('type') && (
                  <TextField
                    label="Type"
                    value={(form.attributes.type as string) ?? ''}
                    onChange={(e) => updateAttributeField('type', e.target.value)}
                    fullWidth
                  />
                )}
                {categoryConfig.fields.includes('size') && (
                  <TextField
                    label="Size"
                    value={(form.attributes.size as string) ?? ''}
                    onChange={(e) => updateAttributeField('size', e.target.value)}
                    fullWidth
                  />
                )}
                {categoryConfig.fields.includes('custom_name_option') && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(form.attributes.custom_name_option)}
                        onChange={(e) => updateAttributeField('custom_name_option', e.target.checked)}
                      />
                    }
                    label="Available with Name?"
                  />
                )}
              </Stack>
            </Box>
          )}

          <TextField
            label="Base price (₹ per unit)"
            type="number"
            value={form.basePrice}
            onChange={(e) => setForm((prev) => ({...prev, basePrice: e.target.value === '' ? '' : Number(e.target.value)}))}
            error={!!errors.basePrice}
            helperText={errors.basePrice}
            fullWidth
          />

          <TextField
            label="Minimum order quantity"
            type="number"
            value={form.minOrderQty}
            onChange={(e) =>
              setForm((prev) => ({...prev, minOrderQty: e.target.value === '' ? '' : Number(e.target.value)}))
            }
            error={!!errors.minOrderQty}
            helperText={errors.minOrderQty}
            fullWidth
          />

          <TextField
            label="Delivery charge (₹)"
            type="number"
            value={form.deliveryCharge}
            onChange={(e) =>
              setForm((prev) => ({...prev, deliveryCharge: e.target.value === '' ? '' : Number(e.target.value)}))
            }
            fullWidth
          />

          <TextField
            label="Lead time (hours)"
            type="number"
            value={form.leadTimeHours}
            onChange={(e) =>
              setForm((prev) => ({...prev, leadTimeHours: e.target.value === '' ? '' : Number(e.target.value)}))
            }
            error={!!errors.leadTimeHours}
            helperText={errors.leadTimeHours}
            fullWidth
          />

          {categoryConfig.bulk && (
            <Box sx={{p: 2, border: '1px solid #E5E7EB', borderRadius: 2}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 1}}>
                <Typography variant="subtitle2">Bulk pricing</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addBulkTier}>
                  Add tier
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                {form.bulkTiers.map((tier, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Min qty"
                      type="number"
                      size="small"
                      value={tier.minQty}
                      onChange={(e) =>
                        updateBulkTier(index, 'minQty', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Price (₹)"
                      type="number"
                      size="small"
                      value={tier.price}
                      onChange={(e) =>
                        updateBulkTier(index, 'price', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      fullWidth
                    />
                    <IconButton aria-label="remove tier" onClick={() => removeBulkTier(index)} size="small">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                {form.bulkTiers.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Add bulk price tiers for this category.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          <Box mt={1}>
            <Typography variant="subtitle2" gutterBottom>
              Product image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploadError(null);
                    setUploadingImage(true);
                    const url = await uploadImageToCloudinary(file);
                    setForm((prev) => ({...prev, imageUrl: url}));
                  } catch (err) {
                    console.error(err);
                    setUploadError('Image upload failed. Please try again.');
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </Button>
            {form.imageUrl && (
              <Box mt={1}>
                <Typography variant="caption" color="text.secondary">
                  Preview:
                </Typography>
                <Box
                  component="img"
                  src={form.imageUrl}
                  alt="Product"
                  sx={{mt: 0.5, width: 120, height: 120, objectFit: 'cover', borderRadius: 1}}
                />
              </Box>
            )}
            {uploadError && (
              <Typography variant="caption" color="error">
                {uploadError}
              </Typography>
            )}
          </Box>

          <TextField
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((prev) => ({...prev, imageUrl: e.target.value}))}
            helperText="Paste a direct HTTPS URL or upload an image above."
            fullWidth
          />

          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({...prev, description: e.target.value}))}
            multiline
            minRows={2}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{pt: 1}}>
            <Button variant="text" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingProduct ? 'Save changes' : 'Create material'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
