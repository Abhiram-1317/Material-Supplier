"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Box, Button, CircularProgress, Stack, Typography, Alert, TextField, Paper} from "@mui/material";
import {fetchProductById, type ApiProduct} from "@/api/catalog";
import {useCart} from "@/context/CartContext";

export default function ProductDetailPage() {
  const params = useParams<{id: string}>();
  const id = params?.id;
  const router = useRouter();
  const {addItem} = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductById(id as string);
        setProduct(res);
        setQuantity(res.minOrderQty);
      } catch (e) {
        console.error("fetchProductById error", e);
        setError("Unable to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Typography>No product found.</Typography>;
  }

  const handleAdd = () => {
    if (!product) return;
    const qty = quantity && quantity >= product.minOrderQty ? quantity : product.minOrderQty;
    addItem(product, qty);
  };

  return (
    <Stack spacing={2.5}>
      {product.imageUrl ? (
        <Box
          component="img"
          src={product.imageUrl}
          alt={product.name}
          sx={{
            width: "100%",
            maxHeight: 260,
            objectFit: "cover",
            borderRadius: 2,
            mb: 1,
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: 200,
            bgcolor: "#E5E7EB",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        </Box>
      )}

      <Paper sx={{p: 3}}>
        <Stack spacing={1.25}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.supplier.companyName} · {product.city.name}
          </Typography>
          <Typography variant="h6">
            ₹{Number(product.basePrice).toFixed(0)} / {product.unit.toLowerCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Min {product.minOrderQty} {product.unit.toLowerCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lead time: {product.leadTimeHours}h
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {product.category.name}
          </Typography>
          {product.description ? (
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
          ) : null}

          <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center" pt={1.5}>
            <TextField
              type="number"
              label="Quantity"
              size="small"
              value={quantity ?? product.minOrderQty}
              onChange={(e) => {
                const val = Number(e.target.value);
                setQuantity(Number.isFinite(val) ? val : product.minOrderQty);
              }}
              inputProps={{min: product.minOrderQty}}
            />
            <Button variant="contained" onClick={handleAdd}>
              Add to cart
            </Button>
            <Button variant="text" onClick={() => router.push("/cart")}>Go to cart</Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
