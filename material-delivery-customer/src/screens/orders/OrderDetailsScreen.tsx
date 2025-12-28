import React, {useEffect, useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import {
  ActivityIndicator,
  Card as PaperCard,
  Snackbar,
  TextInput,
  Button,
  useTheme,
} from 'react-native-paper';

import {fetchOrderById, type ApiOrder} from '../../api/orders';
import {
  fetchOrderRating,
  upsertOrderRating,
  type ApiOrderRating,
} from '../../api/ratings';
import {fetchLatestTrackingPoint, type TrackingPoint} from '../../api/tracking';
import RatingStars from '../../components/ratings/RatingStars';

export function OrderDetailsScreen() {
  const route = useRoute();
  const {orderId} = (route.params || {}) as {orderId: string};
  const theme = useTheme();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loadingRating, setLoadingRating] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [existingRating, setExistingRating] = useState<ApiOrderRating | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [trackingPoint, setTrackingPoint] = useState<TrackingPoint | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await fetchOrderById(orderId);
        if (!mounted) return;
        setOrder(data);
      } catch (err) {
        if (!mounted) return;
        setError('Unable to load order');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (orderId) load();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const loadLatestTracking = async (id: string, silent = false) => {
    try {
      if (!silent) {
        setTrackingLoading(true);
        setTrackingError(null);
      }
      const point = await fetchLatestTrackingPoint(id);
      setTrackingPoint(point);
    } catch (e) {
      if (!silent) {
        setTrackingError('Unable to load live location');
      }
    } finally {
      if (!silent) setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (!order?.id) return;

    loadLatestTracking(order.id);

    const interval = setInterval(() => {
      loadLatestTracking(order.id, true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [order?.id]);

  useEffect(() => {
    const loadRating = async () => {
      if (!order || order.status !== 'DELIVERED') {
        setExistingRating(null);
        setRating(0);
        setComment('');
        return;
      }
      try {
        setLoadingRating(true);
        setRatingError(null);
        const r = await fetchOrderRating(order.id);
        setExistingRating(r);
        if (r) {
          setRating(r.rating);
          setComment(r.comment ?? '');
        } else {
          setRating(0);
          setComment('');
        }
      } catch (e) {
        setRatingError('Failed to load rating');
      } finally {
        setLoadingRating(false);
      }
    };

    loadRating();
  }, [order?.id, order?.status]);

  const handleSubmitRating = async () => {
    if (!order) return;
    if (rating < 1 || rating > 5) {
      setRatingError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSavingRating(true);
      setRatingError(null);
      const result = await upsertOrderRating(order.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      setExistingRating(result);
      setSnackbarVisible(true);
    } catch (e) {
      setRatingError('Failed to submit rating. Please try again.');
    } finally {
      setSavingRating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: '#DC2626'}}>{error || 'Order not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 40}}>
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 8}}>
          {order.orderCode || order.id}
        </Text>
        <Text style={{color: '#4B5563', marginBottom: 12}}>{order.status}</Text>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginBottom: 12,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
            Delivery
          </Text>
          <Text style={{color: '#111827'}}>{order.site.label}</Text>
          <Text style={{color: '#4B5563'}}>
            {order.site.addressLine}, {order.site.city.name} - {order.site.pincode}
          </Text>
          <Text style={{color: '#111827', marginTop: 6}}>Slot: {order.scheduledSlot}</Text>
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginBottom: 12,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
            Items
          </Text>
          {order.items.map(item => (
            <View
              key={item.id}
              style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
              <Text style={{color: '#111827'}}>{item.product.name}</Text>
              <Text style={{color: '#111827'}}>
                {item.quantity} × ₹{Number(item.unitPrice).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            marginBottom: 12,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>Summary</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
            <Text style={{color: '#4B5563'}}>Delivery fee</Text>
            <Text style={{fontWeight: '700'}}>₹{Number(order.deliveryFee).toFixed(2)}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
            <Text style={{color: '#4B5563'}}>Tax</Text>
            <Text style={{fontWeight: '700'}}>₹{Number(order.taxAmount).toFixed(2)}</Text>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontWeight: '700'}}>Total</Text>
            <Text style={{fontWeight: '700'}}>₹{Number(order.totalAmount).toFixed(2)}</Text>
          </View>
        </View>

        <PaperCard style={{marginBottom: 12}}>
          <PaperCard.Title title="Truck location" />
          <PaperCard.Content>
            {trackingLoading ? (
              <ActivityIndicator />
            ) : trackingError ? (
              <Text style={{color: theme.colors.error}}>{trackingError}</Text>
            ) : !trackingPoint ? (
              <Text style={{color: theme.colors.onSurfaceDisabled}}>
                No live location shared yet.
              </Text>
            ) : (
              <>
                <Text>Latitude: {trackingPoint.latitude.toFixed(5)}</Text>
                <Text>Longitude: {trackingPoint.longitude.toFixed(5)}</Text>
                <Text style={{color: theme.colors.onSurfaceDisabled}}>
                  Last updated {new Date(trackingPoint.createdAt).toLocaleString()}
                </Text>
              </>
            )}
          </PaperCard.Content>
        </PaperCard>

        <PaperCard style={{marginBottom: 12}}>
          <PaperCard.Title title="Rate this order" />
          <PaperCard.Content>
            {order?.status !== 'DELIVERED' ? (
              <Text style={{color: theme.colors.onSurfaceDisabled}}>
                You can rate this order after it has been delivered.
              </Text>
            ) : loadingRating ? (
              <ActivityIndicator />
            ) : (
              <>
                <RatingStars
                  rating={rating}
                  onChange={setRating}
                  editable={!savingRating}
                  size={28}
                />
                <TextInput
                  label="Comment (optional)"
                  mode="outlined"
                  multiline
                  value={comment}
                  onChangeText={setComment}
                  style={{marginTop: 12}}
                  editable={!savingRating}
                />
                {ratingError && (
                  <Text style={{color: theme.colors.error, marginTop: 4}}>{ratingError}</Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleSubmitRating}
                  loading={savingRating}
                  disabled={savingRating}
                  style={{marginTop: 12}}>
                  {existingRating ? 'Update rating' : 'Submit rating'}
                </Button>
              </>
            )}
          </PaperCard.Content>
        </PaperCard>
      </ScrollView>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        Rating saved
      </Snackbar>
    </SafeAreaView>
  );
}
