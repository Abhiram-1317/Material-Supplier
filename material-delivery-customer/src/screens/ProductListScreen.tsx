import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {fetchProducts, type ApiProduct, type ApiUnit} from '../api/catalog';
import {useLocation} from '../context/LocationContext';
import {HomeStackParamList} from '../navigation/HomeNavigator';

const UNIT_LABELS: Record<ApiUnit, string> = {
  TON: 'ton',
  M3: 'm3',
  BAG: 'bag',
  PIECE: 'piece',
};

type RouteParams = {
  categorySlug?: string;
  categoryName?: string;
};

export function ProductListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute();
  const {categorySlug, categoryName} = (route.params || {}) as RouteParams;
  const {currentCity, cityIds} = useLocation();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const cityId = useMemo(() => cityIds[currentCity], [cityIds, currentCity]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetchProducts({
          cityId,
          categorySlug,
        });
        if (!isMounted) return;
        setProducts(response.items);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load products');
        setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [cityId, categorySlug]);

  const renderItem = ({item}: {item: ApiProduct}) => (
    <Pressable
      onPress={() =>
        navigation.navigate('ProductDetails', {productId: item.id})
      }
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
      }}>
      {item.imageUrl ? (
        <Image
          source={{uri: item.imageUrl}}
          style={{width: '100%', height: 120, borderRadius: 8}}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            height: 120,
            width: '100%',
            backgroundColor: '#E5E7EB',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}
        >
          <Text style={{fontSize: 32, fontWeight: '700', color: '#9CA3AF'}}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={{marginTop: 12}}>
      <Text style={{fontSize: 16, fontWeight: '700', marginBottom: 4}}>
        {item.name}
      </Text>
      <Text style={{color: '#4B5563', marginBottom: 4}}>
        {item.supplier.companyName} • {item.city.name}
      </Text>
      <Text style={{fontWeight: '600'}}>
        ₹{Number(item.basePrice)} / {UNIT_LABELS[item.unit]}
      </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{padding: 24, flex: 1}}>
        <View style={{marginBottom: 12}}>
          <Text style={{fontSize: 22, fontWeight: '700'}}>
            {categoryName ? categoryName : 'Materials near you'}
          </Text>
          <Text style={{color: '#6B7280'}}>
            Showing materials for {currentCity}
            {cityId ? '' : ' (city not synced yet)'}
          </Text>
        </View>

        {loading && (
          <View style={{paddingVertical: 12}}>
            <ActivityIndicator />
          </View>
        )}
        {error && !loading && (
          <Text style={{color: '#DC2626', marginBottom: 8}}>{error}</Text>
        )}
        {!loading && products.length === 0 && !error && (
          <Text style={{color: '#6B7280'}}>No materials found.</Text>
        )}

        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
