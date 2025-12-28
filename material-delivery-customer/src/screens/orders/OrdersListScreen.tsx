import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, ActivityIndicator, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {fetchOrders, type ApiOrder} from '../../api/orders';
import {OrdersStackParamList} from '../../navigation/OrdersNavigator';

export function OrdersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await fetchOrders();
        if (!mounted) return;
        setOrders(data);
      } catch (err) {
        if (!mounted) return;
        setError('Unable to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = ({item}: {item: ApiOrder}) => (
    <Pressable
      onPress={() => navigation.navigate('OrderDetails', {orderId: item.id})}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}>
      <Text style={{fontWeight: '700', marginBottom: 4}}>{item.orderCode || item.id}</Text>
      <Text style={{color: '#4B5563', marginBottom: 4}}>
        {item.site.label}, {item.site.city.name}
      </Text>
      <Text style={{color: '#4B5563', marginBottom: 4}}>Slot: {item.scheduledSlot}</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{color: '#1F2937'}}>{item.items.length} items</Text>
        <Text style={{fontWeight: '700'}}>₹{Number(item.totalAmount).toFixed(2)}</Text>
      </View>
      <Text style={{color: '#111827', marginTop: 6}}>{item.status}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{padding: 24, flex: 1}}>
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 12}}>Orders</Text>
        {loading && (
          <View style={{paddingVertical: 12}}>
            <ActivityIndicator />
          </View>
        )}
        {error && !loading && (
          <Text style={{color: '#DC2626', marginBottom: 8}}>{error}</Text>
        )}
        {!loading && orders.length === 0 && !error && (
          <Text style={{color: '#6B7280'}}>No orders yet.</Text>
        )}
        <FlatList data={orders} keyExtractor={item => item.id} renderItem={renderItem} />
      </View>
    </SafeAreaView>
  );
}
