"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {fetchCustomerSites, type ApiCustomerSite} from "@/api/customer";
import {createOrder} from "@/api/orders";
import {useCart} from "@/context/CartContext";
import {fetchSlotAvailability, type SlotAvailability} from "@/api/slotAvailability";

type SlotDay = "TODAY" | "TOMORROW";

const SLOT_TIMES = ["8–11 AM", "11–2 PM", "2–5 PM", "5–8 PM"];

export default function CheckoutPage() {
  const router = useRouter();
  const {items, subtotal, clearCart} = useCart();

  const [sites, setSites] = useState<ApiCustomerSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [slotDay, setSlotDay] = useState<SlotDay>("TODAY");
  const [slotTime, setSlotTime] = useState<string>(SLOT_TIMES[0]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability[]>([]);
  const [slotAvailLoading, setSlotAvailLoading] = useState(false);
  const [slotAvailError, setSlotAvailError] = useState<string | null>(null);

  const supplierId = items[0]?.product?.supplier?.id;

  useEffect(() => {
    const load = async () => {
      setLoadingSites(true);
      try {
        const res = await fetchCustomerSites();
        setSites(res);
        const defaultSite = res.find((s) => s.isDefault) ?? res[0];
        setSelectedSiteId(defaultSite ? defaultSite.id : null);
      } catch (e) {
        console.error(e);
        setError("Unable to load delivery sites.");
      } finally {
        setLoadingSites(false);
      }
    };
    load();
  }, []);

  const computeDateIso = () => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (slotDay === "TOMORROW") {
      base.setDate(base.getDate() + 1);
    }
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const loadAvailability = async () => {
      if (!supplierId) return;
      try {
        setSlotAvailLoading(true);
        setSlotAvailError(null);
        const dateIso = computeDateIso();
        const data = await fetchSlotAvailability({supplierId, date: dateIso});
        setSlotAvailability(data);
      } catch (e) {
        setSlotAvailError("Unable to load slot availability");
      } finally {
        setSlotAvailLoading(false);
      }
    };
    void loadAvailability();
  }, [supplierId, slotDay]);

  const getSlotStatus = (label: string) => {
    const s = slotAvailability.find((a) => a.label === label);
    if (!s || !s.isActive) return {text: "Unavailable", state: "UNAVAILABLE" as const};
    if (s.available <= 0) return {text: "Full", state: "FULL" as const};
    const used = s.maxOrdersPerDay - s.available;
    const limited = s.maxOrdersPerDay > 0 && used >= s.maxOrdersPerDay - 1;
    if (limited) return {text: "Limited", state: "LIMITED" as const};
    return {text: "Available", state: "AVAILABLE" as const};
  };

  useEffect(() => {
    if (error) setError(null);
  }, [slotDay, slotTime, selectedSiteId]);

  const deliveryFee = 250;
  const taxAmount = useMemo(() => Number((subtotal * 0.18).toFixed(2)), [subtotal]);
  const total = subtotal + deliveryFee + taxAmount;
  const scheduledSlot = `${slotDay === "TODAY" ? "Today" : "Tomorrow"}, ${slotTime}`;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!selectedSiteId) {
      setError("Please select a delivery site.");
      return;
    }

    try {
      setPlacing(true);
      setError(null);

      const firstSupplierId = items[0].product.supplier.id;

      const order = await createOrder({
        siteId: selectedSiteId,
        supplierId: firstSupplierId,
        scheduledSlot,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      console.error(err);
      let message = "Failed to place order. Please try again.";

      if (axios.isAxiosError(err)) {
        const rawMessage = err.response?.data?.message;
        if (typeof rawMessage === "string") {
          message = rawMessage;
        } else if (Array.isArray(rawMessage) && typeof rawMessage[0] === "string") {
          message = rawMessage[0];
        }
      }

      setError(message);
    } finally {
      setPlacing(false);
    }
  };

  if (loadingSites) {
    return (
      <Box minHeight="60vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{mb: 2}}>
          {error}
        </Alert>
      )}

      <Paper sx={{p: 2}}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>Delivery site</Typography>
            <Button size="small" onClick={() => router.push("/addresses")}>Manage sites</Button>
          </Stack>
          {sites.length === 0 ? (
            <Alert severity="info">No sites found. Please add an address in Addresses.</Alert>
          ) : (
            <FormControl>
              <RadioGroup
                value={selectedSiteId ?? ""}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                {sites.map((site) => (
                  <FormControlLabel
                    key={site.id}
                    value={site.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography fontWeight={600}>{site.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {site.addressLine}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Stack>
      </Paper>

      <Paper sx={{p: 2}}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>Delivery slot</Typography>
          <Stack direction="row" spacing={2}>
            <FormControl>
              <FormLabel>Day</FormLabel>
              <RadioGroup
                row
                value={slotDay}
                onChange={(e) => setSlotDay(e.target.value as SlotDay)}
              >
                <FormControlLabel value="TODAY" control={<Radio />} label="Today" />
                <FormControlLabel value="TOMORROW" control={<Radio />} label="Tomorrow" />
              </RadioGroup>
            </FormControl>
          </Stack>

          <Box mt={1}>
            {slotAvailLoading && (
              <Typography variant="caption" color="text.secondary">
                Checking slot availability…
              </Typography>
            )}
            {slotAvailError && (
              <Alert severity="warning" sx={{mt: 1}}>
                {slotAvailError}
              </Alert>
            )}

            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              {SLOT_TIMES.map((label) => {
                const {text, state} = getSlotStatus(label);
                const disabled = state === 'FULL' || state === 'UNAVAILABLE';
                const selected = slotTime === label;

                return (
                  <Button
                    key={label}
                    variant={selected ? 'contained' : 'outlined'}
                    color={disabled ? 'inherit' : 'primary'}
                    disabled={disabled}
                    onClick={() => setSlotTime(label)}
                    size="small"
                    sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                  >
                    {label}
                    <Chip
                      label={text}
                      size="small"
                      sx={{
                        ml: 0.5,
                        bgcolor:
                          state === 'FULL'
                            ? 'error.main'
                            : state === 'LIMITED'
                              ? 'warning.main'
                              : 'success.main',
                        color: 'white',
                      }}
                    />
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{p: 2}}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>Order summary</Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>₹{subtotal.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Delivery fee</Typography>
            <Typography>₹{deliveryFee.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Tax (18%)</Typography>
            <Typography>₹{taxAmount.toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" fontWeight={700}>
            <Typography>Total payable</Typography>
            <Typography>₹{total.toFixed(2)}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Payment method: Cash on Delivery
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handlePlaceOrder}
            disabled={placing || sites.length === 0 || items.length === 0}
          >
            {placing ? "Placing order..." : "Place order (COD)"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
