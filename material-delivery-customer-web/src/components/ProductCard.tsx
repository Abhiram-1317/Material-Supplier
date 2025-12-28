"use client";

import {Card, CardActionArea, CardContent, CardMedia, Box, Typography, Chip} from "@mui/material";
import type {ApiProduct} from "@/api/catalog";

interface ProductCardProps {
  product: ApiProduct;
  onClick?: () => void;
}

export function ProductCard({product, onClick}: ProductCardProps) {
  const price = Number(product.basePrice);
  const unitLabel = product.unit.toLowerCase();
  const hasImage = Boolean(product.imageUrl);

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
        overflow: "hidden",
      }}
    >
      <CardActionArea onClick={onClick}>
        {hasImage ? (
          <CardMedia component="img" height="140" image={product.imageUrl as string} alt={product.name} />
        ) : (
          <Box
            sx={{
              height: 140,
              bgcolor: "#E5E7EB",
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
        <CardContent sx={{p: 1.5}}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {product.supplier.companyName}
          </Typography>
          <Box mt={0.5} display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={600}>
              ₹{Number.isNaN(price) ? "-" : price.toFixed(0)} / {unitLabel}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Min {product.minOrderQty} {unitLabel}
          </Typography>
          <Box mt={0.5} display="flex" alignItems="center" gap={1}>
            <Chip label={product.city.name} size="small" />
            {product.leadTimeHours ? (
              <Typography variant="caption" color="text.secondary">
                {product.leadTimeHours}h ETA
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
