"use client";

import {useEffect, useMemo, useState} from "react";
import {useParams} from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {fetchOrderById, type ApiOrder} from "@/api/orders";
import {fetchOrderRating, upsertOrderRating, type ApiOrderRating} from "@/api/ratings";
import {fetchLatestTrackingPoint, type TrackingPoint} from "@/api/tracking";

export default function OrderDetailPage() {
  const params = useParams<{id: string}>();
  const id = params?.id;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);
  const [existingRating, setExistingRating] = useState<ApiOrderRating | null>(null);
  const [trackingPoint, setTrackingPoint] = useState<TrackingPoint | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchOrderById(id as string);
        setOrder(res);
      } catch (e) {
        console.error("fetchOrderById error", e);
        setError("Unable to load order");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadRating = async () => {
      if (!order) return;
      if (order.status !== "DELIVERED") {
        setExistingRating(null);
        setRatingValue(null);
        setComment("");
        return;
      }
      try {
        setRatingLoading(true);
        setRatingError(null);
        setRatingSuccess(null);
        const r = await fetchOrderRating(order.id);
        setExistingRating(r);
        if (r) {
          setRatingValue(r.rating);
          setComment(r.comment ?? "");
        } else {
          setRatingValue(null);
          setComment("");
        }
      } catch (_e) {
        setRatingError("Failed to load rating");
      } finally {
        setRatingLoading(false);
      }
    };
    loadRating();
  }, [order?.id, order?.status]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setTrackingLoading(true);
        setTrackingError(null);
        const point = await fetchLatestTrackingPoint(id as string);
        setTrackingPoint(point);
      } catch (e) {
        setTrackingError("Unable to load live location");
      } finally {
        setTrackingLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSubmitRating = async () => {
    if (!order) return;
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setRatingError("Please select a rating between 1 and 5 stars.");
      setRatingSuccess(null);
      return;
    }
    try {
      setRatingSaving(true);
      setRatingError(null);
      setRatingSuccess(null);
      const result = await upsertOrderRating(order.id, {
        rating: ratingValue,
        comment: comment.trim() || undefined,
      });
      setExistingRating(result);
      setRatingSuccess("Rating saved");
    } catch (_e) {
      setRatingError("Failed to save rating. Please try again.");
    } finally {
      setRatingSaving(false);
    }
  };

  const subtotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  }, [order]);

  const statusColor: Record<string, "default" | "success" | "warning" | "error"> = {
    PLACED: "default",
    ACCEPTED: "warning",
    DISPATCHED: "warning",
    DELIVERED: "success",
    CANCELLED: "error",
  };

  if (loading) {
    return (
      <Paper sx={{p: 3, textAlign: "center"}}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{p: 3}}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!order) {
    return <Typography>No order found.</Typography>;
  }

  return (
    <Paper sx={{p: 3}}>
      <Stack spacing={2}>
        <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems={{xs: "flex-start", sm: "center"}}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Order {order.orderCode}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Chip label={order.status} color={statusColor[order.status] ?? "default"} />
        </Stack>

        <Stack direction={{xs: "column", sm: "row"}} spacing={3}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Delivery address
            </Typography>
            <Typography fontWeight={700}>{order.site?.label}</Typography>
            <Typography color="text.secondary">{order.site?.addressLine}</Typography>
            <Typography color="text.secondary">
              {order.site?.city?.name} • {order.site?.pincode}
            </Typography>
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Payment
            </Typography>
            <Typography>Method: {order.paymentMethod}</Typography>
            <Typography>Status: {order.paymentStatus}</Typography>
            <Typography color="text.secondary">Slot: {order.scheduledSlot}</Typography>
          </Box>
        </Stack>

        <Divider />

        <Typography variant="subtitle1" fontWeight={700}>
          Items
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell align="right">
                  {item.quantity} {item.product.unit}
                </TableCell>
                <TableCell align="right">₹{Number(item.totalPrice).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider />

        <Stack spacing={1} alignItems="flex-end">
          <Typography color="text.secondary">Subtotal: ₹{subtotal.toFixed(2)}</Typography>
          <Typography color="text.secondary">Delivery: ₹{Number(order.deliveryFee).toFixed(2)}</Typography>
          <Typography color="text.secondary">Tax: ₹{Number(order.taxAmount).toFixed(2)}</Typography>
          <Typography variant="h6" fontWeight={700}>
            Total: ₹{Number(order.totalAmount).toFixed(2)}
          </Typography>
        </Stack>

        <Box mt={3} width="100%">
          <Typography variant="h6" gutterBottom>
            Truck location
          </Typography>
          <Paper sx={{p: 2}}>
            {trackingLoading ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress size={20} />
              </Box>
            ) : trackingError ? (
              <Alert severity="error">{trackingError}</Alert>
            ) : !trackingPoint ? (
              <Typography variant="body2" color="text.secondary">
                No live location shared yet.
              </Typography>
            ) : (
              <>
                <Typography variant="body2">
                  Latitude: {trackingPoint.latitude.toFixed(5)}, Longitude: {" "}
                  {trackingPoint.longitude.toFixed(5)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated {new Date(trackingPoint.createdAt).toLocaleString()}
                </Typography>
              </>
            )}
          </Paper>
        </Box>

        <Box mt={3} width="100%">
          <Typography variant="h6" gutterBottom>
            Rating &amp; review
          </Typography>
          {order.status !== "DELIVERED" ? (
            <Paper sx={{p: 2}}>
              <Typography variant="body2" color="text.secondary">
                You can rate this order after it has been delivered.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{p: 2, display: "flex", flexDirection: "column", gap: 2}}>
              {ratingLoading ? (
                <Box display="flex" justifyContent="center">
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating
                      name="order-rating"
                      value={ratingValue}
                      onChange={(_, newValue) => setRatingValue(newValue)}
                    />
                    {ratingValue && (
                      <Typography variant="body2">{ratingValue} / 5</Typography>
                    )}
                  </Box>
                  <TextField
                    label="Comment (optional)"
                    multiline
                    minRows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fullWidth
                  />
                  {ratingError && (
                    <Alert severity="error" variant="outlined">
                      {ratingError}
                    </Alert>
                  )}
                  {ratingSuccess && (
                    <Alert severity="success" variant="outlined">
                      {ratingSuccess}
                    </Alert>
                  )}
                  <Box>
                    <Button
                      variant="contained"
                      onClick={handleSubmitRating}
                      disabled={ratingSaving}
                    >
                      {existingRating ? "Update rating" : "Submit rating"}
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
