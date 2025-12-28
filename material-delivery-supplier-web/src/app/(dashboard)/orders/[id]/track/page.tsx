"use client";

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Alert, Box, Button, Paper, Typography} from '@mui/material';
import {fetchLatestTrackingPoint, sendTrackingPoint, TrackingPoint} from '@/api/tracking';

export default function OrderTrackPage() {
  const params = useParams<{id: string}>();
  const orderId = params?.id;
  const router = useRouter();

  const [watchId, setWatchId] = useState<number | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [lastPoint, setLastPoint] = useState<TrackingPoint | null>(null);
  const [sending, setSending] = useState(false);

  const postPoint = async (lat: number, lng: number) => {
    try {
      setSending(true);
      const point = await sendTrackingPoint(orderId, lat, lng);
      setLastPoint(point);
    } catch (err) {
      setTrackingError('Failed to send tracking update');
    } finally {
      setSending(false);
    }
  };

  const handleStartTracking = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setTrackingError('Geolocation is not supported in this browser.');
      return;
    }

    setTrackingError(null);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const {latitude, longitude} = pos.coords;
        await postPoint(latitude, longitude);
      },
      (err) => {
        setTrackingError(err.message || 'Failed to get location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    setWatchId(id);
  };

  const handleStopTracking = () => {
    if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
    setWatchId(null);
  };

  useEffect(() => {
    return () => {
      if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  useEffect(() => {
    const loadLast = async () => {
      if (!orderId) return;
      try {
        const p = await fetchLatestTrackingPoint(orderId);
        setLastPoint(p);
      } catch {
        // ignore
      }
    };
    loadLast();
  }, [orderId]);

  if (!orderId) {
    return (
      <Box>
        <Typography variant="h6">Invalid order id</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5">Live tracking for order {orderId}</Typography>
      <Typography variant="body2" color="text.secondary">
        Keep this page open on your phone while the truck is on the way. We will periodically send your GPS location so the
        customer can see progress.
      </Typography>

      {trackingError ? <Alert severity="error">{trackingError}</Alert> : null}

      <Paper sx={{p: 2}}>
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          {watchId === null ? (
            <Button variant="contained" onClick={handleStartTracking} disabled={sending}>
              Start tracking
            </Button>
          ) : (
            <Button variant="outlined" color="secondary" onClick={handleStopTracking}>
              Stop tracking
            </Button>
          )}
          <Button variant="text" onClick={() => router.push(`/orders/${orderId}`)}>
            Back to order details
          </Button>
          {watchId !== null ? (
            <Typography variant="body2" color="success.main" sx={{alignSelf: 'center'}}>
              Tracking active
            </Typography>
          ) : null}
          {sending ? (
            <Typography variant="body2" color="text.secondary" sx={{alignSelf: 'center'}}>
              Sending latest position…
            </Typography>
          ) : null}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Latest position
        </Typography>
        {lastPoint ? (
          <Box>
            <Typography variant="body2">
              Lat: {lastPoint.latitude.toFixed(5)}, Lng: {lastPoint.longitude.toFixed(5)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Updated at {new Date(lastPoint.createdAt).toLocaleString()}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No tracking points yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
