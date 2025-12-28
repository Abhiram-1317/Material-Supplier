"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography} from "@mui/material";
import {fetchProducts, type ApiProduct} from "@/api/catalog";
import {ProductCard} from "@/components/ProductCard";
import {useLocationContext} from "@/context/LocationContext";

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";

  const {currentCity} = useLocationContext();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiProduct[]>([]);

  const doSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts({cityId: currentCity?.id, search: q, pageSize: 20});
      setResults(res.items);
    } catch {
      setError("Unable to search products right now.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/search?q=${encodeURIComponent(query)}`);
    await doSearch(query);
  };

  return (
    <Stack spacing={2.5}>
      <Paper sx={{p: 2}}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center">
            <Box sx={{flex: 1, width: "100%"}}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search sand, cement, RMC, bricks…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Box>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </Stack>
        </form>
        {error ? (
          <Alert severity="error" sx={{mt: 2}}>
            {error}
          </Alert>
        ) : null}
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Typography color="text.secondary">No products found. Try another term.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {results.map((product) => (
            <Box key={product.id}>
              <ProductCard product={product} onClick={() => router.push(`/product/${product.id}`)} />
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}
