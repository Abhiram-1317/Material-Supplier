"use client";

import {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {createCustomerSite, fetchCustomerSites, type ApiCustomerSite} from "@/api/customer";
import {useLocationContext} from "@/context/LocationContext";

export default function AddressesPage() {
  const {cities} = useLocationContext();
  const [sites, setSites] = useState<ApiCustomerSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingFromLocation, setCreatingFromLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCustomerSites();
        setSites(res);
      } catch (_err) {
        setError("Failed to load sites");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUseMyLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser.");
      return;
    }

    setCreatingFromLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const {latitude, longitude} = pos.coords;

          const warangalCenter = {lat: 17.9689, lng: 79.5941};
          const hanumakondaCenter = {lat: 18.004, lng: 79.56};
          const dist = (a: {lat: number; lng: number}, b: {lat: number; lng: number}) =>
            Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));

          const dWar = dist({lat: latitude, lng: longitude}, warangalCenter);
          const dHan = dist({lat: latitude, lng: longitude}, hanumakondaCenter);
          const targetName = dWar <= dHan ? "Warangal" : "Hanumakonda";

          const city =
            cities.find((c) => c.name.toLowerCase().includes(targetName.toLowerCase())) ?? null;

          if (!city) {
            setLocationError("Could not map detected location to a supported city.");
            setCreatingFromLocation(false);
            return;
          }

          const label = "Current location";
          const addressLine = `${targetName} current location`;
          const pincode = "000000";

          await createCustomerSite({
            label,
            cityId: city.id,
            addressLine,
            pincode,
            isDefault: sites.every((s) => !s.isDefault),
            latitude,
            longitude,
          });

          const fresh = await fetchCustomerSites();
          setSites(fresh);
        } catch (_err) {
          setLocationError("Failed to save location as site.");
        } finally {
          setCreatingFromLocation(false);
        }
      },
      (err) => {
        setCreatingFromLocation(false);
        setLocationError(err.message || "Failed to get location.");
      },
      {enableHighAccuracy: true, timeout: 10000},
    );
  };

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

  return (
    <Stack spacing={2}>
      <Paper sx={{p: 2}}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Saved sites
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUseMyLocation}
            disabled={creatingFromLocation}
          >
            {creatingFromLocation ? "Detecting..." : "Use my location"}
          </Button>
        </Box>
        {locationError && (
          <Alert severity="warning" sx={{mb: 2}}>
            {locationError}
          </Alert>
        )}

        <Stack spacing={1}>
          {sites.map((site) => (
            <Paper key={site.id} variant="outlined" sx={{p: 2}}>
              <Typography fontWeight={700}>{site.label}</Typography>
              <Typography color="text.secondary">
                {site.addressLine}, {site.city.name} - {site.pincode}
              </Typography>
              {site.latitude != null && site.longitude != null ? (
                <Typography variant="body2" color="text.secondary">
                  Lat: {site.latitude.toFixed(4)}, Lng: {site.longitude.toFixed(4)}
                </Typography>
              ) : null}
              {site.isDefault && (
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  Default
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
