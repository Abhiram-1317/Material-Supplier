import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Button} from 'react-native-paper';

import {fetchOrderById, type ApiOrder} from '../../api/orders';

export function OrderSummaryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {orderId} = (route.params || {}) as {orderId: string};

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

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
      <View style={{flex: 1, padding: 24, justifyContent: 'center'}}>
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 8}}>
          Order placed successfully
        </Text>
        <Text style={{color: '#4B5563', marginBottom: 16}}>
          Order ID: {order.orderCode || order.id}
        </Text>

        <View style={{backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16}}>
          <Text style={{fontWeight: '700', marginBottom: 4}}>Delivery</Text>
          <Text style={{color: '#111827'}}>{order.site.label}</Text>
          <Text style={{color: '#4B5563'}}>
            {order.site.addressLine}, {order.site.city.name} - {order.site.pincode}
          </Text>
          <Text style={{color: '#111827', marginTop: 6}}>Slot: {order.scheduledSlot}</Text>
        </View>

        <Text style={{fontWeight: '700', marginBottom: 4}}>
          Items: {order.items.length}
        </Text>
        <Text style={{fontWeight: '700', marginBottom: 12}}>
          Total: ₹{Number(order.totalAmount).toFixed(2)}
        </Text>

        <Button mode="contained" onPress={() => navigation.navigate('Orders' as never)}>
          Track order
        </Button>
      </View>
    </SafeAreaView>
  );
}
