"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Select,
  MenuItem,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import {useLocationContext} from "@/context/LocationContext";
import {fetchCategories, fetchProducts, type ApiCategory, type ApiProduct} from "@/api/catalog";
import {ProductCard} from "@/components/ProductCard";

export default function BrowsePage() {
  const router = useRouter();
  const {
    cities,
    currentCity,
    loading: loadingCities,
    error: cityError,
    setCurrentCityId,
    autoDetectCity,
    autoDetecting,
    autoDetectError,
  } = useLocationContext();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        setCategories(res);
      } catch (e) {
        console.error("fetchCategories error", e);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (!currentCity) return;
      setLoadingCatalog(true);
      setError(null);
      try {
        const res = await fetchProducts({cityId: currentCity.id, categorySlug: selectedCategory ?? undefined, pageSize: 20});
        setProducts(res.items);
      } catch (e) {
        console.error("fetchProducts error", e);
        setError("Unable to load catalog");
      } finally {
        setLoadingCatalog(false);
      }
    };
    loadProducts();
  }, [currentCity?.id, selectedCategory]);

  if (loadingCities) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (cityError) {
    return (
      <Alert severity="error">{cityError}</Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography variant="caption" sx={{opacity: 0.8}}>
          Delivering to
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={0.5} flexWrap="wrap">
          <Typography variant="h6">
            {currentCity?.name ?? "Select city"}
          </Typography>
          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: 1,
            }}
          >
            <InputLabel id="city-select-label" sx={{color: "#E5E7EB"}}>
              City
            </InputLabel>
            <Select
              labelId="city-select-label"
              value={currentCity?.id ?? ""}
              label="City"
              onChange={(e) => setCurrentCityId(Number(e.target.value))}
              sx={{
                color: "primary.contrastText",
                "& .MuiSvgIcon-root": {color: "primary.contrastText"},
              }}
            >
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            onClick={autoDetectCity}
            disabled={autoDetecting}
            sx={{borderColor: "rgba(255,255,255,0.6)", color: "primary.contrastText"}}
          >
            {autoDetecting ? "Detecting..." : "Use my location"}
          </Button>
        </Box>

        <TextField
          fullWidth
          size="small"
          placeholder="Search sand, cement, RMC, bricks…"
          sx={{
            mt: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
          onClick={() => router.push("/search")}
          InputProps={{readOnly: true}}
        />
      </Box>

      {autoDetectError && (
        <Alert severity="warning" sx={{mt: 1}}>
          {autoDetectError}
        </Alert>
      )}

      <Box>
        <Box mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Categories
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1,
          }}
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <Chip
                key={cat.slug}
                label={cat.name}
                clickable
                color={active ? "primary" : "default"}
                variant={active ? "filled" : "outlined"}
                onClick={() => setSelectedCategory(active ? null : cat.slug)}
                sx={{borderRadius: 999, bgcolor: "background.paper"}}
              />
            );
          })}
        </Box>
      </Box>

      <Stack spacing={1.5}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
            Materials near you
          </Typography>
        </Box>
        {loadingCatalog && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loadingCatalog && !error && products.length === 0 && (
          <Typography color="text.secondary">No products found for this selection.</Typography>
        )}
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={product.id}>
              <ProductCard
                product={product}
                onClick={() => router.push(`/product/${product.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
