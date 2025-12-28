import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, ActivityIndicator, ScrollView, Pressable, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';

import {fetchProductById, type ApiProduct, type ApiUnit} from '../api/catalog';
import {useCart} from '../context/CartContext';

const UNIT_LABELS: Record<ApiUnit, string> = {
  TON: 'ton',
  M3: 'm3',
  BAG: 'bag',
  PIECE: 'piece',
};

const formatCurrency = (value: number | string) => `₹${Number(value).toLocaleString('en-IN', {maximumFractionDigits: 2})}`;

type RouteParams = {
  productId: string;
};

export function ProductDetailsScreen() {
  const route = useRoute();
  const {productId} = (route.params || {}) as RouteParams;
  const {addItem} = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetchProductById(productId);
        if (!isMounted) return;
        setProduct(response);
        setQuantity(response?.minOrderQty ? Math.max(1, Number(response.minOrderQty)) : 1);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load product');
        setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (productId) {
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: '#DC2626', fontWeight: '700', fontSize: 16}}>
            {error || 'Product not found'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const bulkTiers = useMemo(() => {
    if (!product?.bulkTiers) return [] as Array<{minQty: number; price: number}>;
    return (product.bulkTiers as Array<{minQty: number; price: number}>).map((tier) => ({
      minQty: Number(tier.minQty),
      price: Number(tier.price),
    }));
  }, [product]);

  const unitPrice = useMemo(() => {
    const sorted = [...bulkTiers].sort((a, b) => b.minQty - a.minQty);
    const matched = sorted.find((tier) => quantity >= tier.minQty);
    return matched ? matched.price : Number(product.basePrice);
  }, [bulkTiers, product.basePrice, quantity]);

  const deliveryChargePerUnit = Number(product.deliveryCharge ?? 0);
  const deliveryTotal = deliveryChargePerUnit * quantity;
  const totalPrice = unitPrice * quantity + deliveryTotal;

  const attributeEntries = useMemo(() => {
    if (!product.attributes) return [] as Array<[string, any]>;
    return Object.entries(product.attributes).filter(([, value]) => value !== null && value !== undefined && value !== '');
  }, [product.attributes]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 32}}>
        {product.imageUrl ? (
          <Image
            source={{uri: product.imageUrl}}
            style={{width: '100%', height: 220, borderRadius: 12, marginBottom: 16}}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              height: 220,
              width: '100%',
              borderRadius: 12,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{fontSize: 36, fontWeight: '700', color: '#9CA3AF'}}>
              {product.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 8}}>
          {product.name}
        </Text>
        <Text style={{color: '#4B5563', marginBottom: 16}}>
          {product.supplier.companyName} • {product.city.name}
        </Text>

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
            Pricing
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
            <View>
              <Text style={{fontWeight: '600', marginBottom: 2}}>
                Unit price: {formatCurrency(unitPrice)} / {UNIT_LABELS[product.unit]}
              </Text>
              <Text style={{color: '#4B5563'}}>
                Min order: {product.minOrderQty} {UNIT_LABELS[product.unit]}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(product.minOrderQty || 1, q - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{fontSize: 18, fontWeight: '700'}}>-</Text>
              </Pressable>
              <Text style={{minWidth: 48, textAlign: 'center', fontWeight: '700', fontSize: 16}}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => q + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{fontSize: 18, fontWeight: '700'}}>+</Text>
              </Pressable>
            </View>
          </View>
          <View style={{marginTop: 8}}>
            <Text style={{color: '#4B5563'}}>
              Item total: {formatCurrency(unitPrice)} × {quantity} = {formatCurrency(unitPrice * quantity)}
            </Text>
            <Text style={{color: '#4B5563'}}>
              Delivery: + {formatCurrency(deliveryTotal)} ({formatCurrency(deliveryChargePerUnit)} each)
            </Text>
            <Text style={{fontSize: 16, fontWeight: '700', marginTop: 4}}>
              Total: {formatCurrency(totalPrice)}
            </Text>
          </View>
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
            Details
          </Text>
          <Text style={{color: '#4B5563', marginBottom: 4}}>
            Category: {product.category.name}
          </Text>
          <Text style={{color: '#4B5563', marginBottom: 4}}>
            City: {product.city.name}
          </Text>
          <Text style={{color: '#4B5563'}}>
            Lead time: {product.leadTimeHours} hours
          </Text>
        </View>

        {attributeEntries.length > 0 && (
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
              Specifications
            </Text>
            {attributeEntries.map(([key, value]) => (
              <Text key={key} style={{color: '#4B5563', marginBottom: 4}}>
                {key.replace(/_/g, ' ')}: {String(value)}
              </Text>
            ))}
          </View>
        )}

        {bulkTiers.length > 0 && (
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
              Bulk pricing
            </Text>
            {bulkTiers.map((tier) => (
              <Text key={tier.minQty} style={{color: '#4B5563', marginBottom: 4}}>
                Buy {tier.minQty}+ @ {formatCurrency(tier.price)}
              </Text>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => product && addItem(product, quantity)}
          style={{
            backgroundColor: '#1A73E8',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}>
          <Text style={{color: '#FFFFFF', fontWeight: '700'}}>
            Add to cart ({formatCurrency(totalPrice)})
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
