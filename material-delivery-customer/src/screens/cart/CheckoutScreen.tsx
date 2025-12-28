import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, FlatList, Pressable, Alert, Linking} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, RadioButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';

import {useCart} from '../../context/CartContext';
import {useUserProfile} from '../../context/UserProfileContext';
import {HomeStackParamList} from '../../navigation/HomeNavigator';
import {
  createPaymentIntent,
  updatePaymentStatus,
  type ClientPaymentMethod,
  type PaymentIntentResponse,
} from '../../api/payments';

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const {items, totalQuantity, placeOrder} = useCart();
  const {addresses} = useUserProfile();

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    addresses.find(a => a.isDefault)?.id,
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('Tomorrow, 8–11 AM');
  const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>('COD');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [upiStep, setUpiStep] = useState<{
    active: boolean;
    orderId?: string;
    intent?: PaymentIntentResponse;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const totalAmount = useMemo(
    () =>
      items.reduce((acc, item) => acc + Number(item.product.basePrice) * item.quantity, 0),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (items.length === 0 || totalQuantity === 0) {
      Alert.alert('Cart is empty', 'Add at least one item');
      return;
    }
    if (!selectedAddressId) {
      Alert.alert('Select address', 'Please select a delivery address');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select slot', 'Please select a delivery slot');
      return;
    }

    try {
      setProcessingOrder(true);
      setPaymentError(null);
      setCheckoutError(null);
      setUpiStep(null);

      const order = await placeOrder({siteId: selectedAddressId, deliverySlot: selectedSlot});
      if (!order) {
        Alert.alert('Unable to place order', 'Please try again.');
        return;
      }

      if (paymentMethod === 'COD') {
        navigation.navigate('OrderSummary', {orderId: order.id});
        return;
      }

      const intent = await createPaymentIntent({orderId: order.id, paymentMethod: 'UPI'});

      if (!intent.upiDeepLink) {
        setPaymentError('Unable to create UPI payment. Please try COD instead.');
        return;
      }

      try {
        await Linking.openURL(intent.upiDeepLink);
      } catch (openErr) {
        console.warn('Failed to open UPI app', openErr);
      }

      setUpiStep({active: true, orderId: order.id, intent});
    } catch (err: any) {
      console.error(err);
      let message = 'Failed to place order. Please try again.';

      if (axios.isAxiosError(err)) {
        const serverMsg =
          (err.response?.data as any)?.message ||
          (Array.isArray(err.response?.data?.message)
            ? err.response?.data?.message[0]
            : undefined);

        if (typeof serverMsg === 'string') {
          message = serverMsg;
        }
      }

      setCheckoutError(message);
    } finally {
      setProcessingOrder(false);
    }
  };

  useEffect(() => {
    if (checkoutError) setCheckoutError(null);
  }, [selectedSlot, selectedAddressId]);

  const handleConfirmUpiPaid = async () => {
    if (!upiStep?.orderId) return;
    try {
      setProcessingOrder(true);
      setPaymentError(null);

      await updatePaymentStatus({orderId: upiStep.orderId, status: 'PAID'});
      setUpiStep(null);
      navigation.replace('OrderSummary', {orderId: upiStep.orderId});
    } catch (err) {
      console.error(err);
      setPaymentError('Could not confirm payment. Please try again or contact support.');
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <FlatList
        data={addresses}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={{padding: 24}}>
            <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 12}}>
              Checkout
            </Text>
            <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
              Addresses
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <Pressable
            onPress={() => setSelectedAddressId(item.id)}
            style={{
              marginHorizontal: 24,
              marginBottom: 12,
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: item.id === selectedAddressId ? '#1A73E8' : '#E5E7EB',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <RadioButton
              value={item.id}
              status={item.id === selectedAddressId ? 'checked' : 'unchecked'}
              onPress={() => setSelectedAddressId(item.id)}
            />
            <View style={{flex: 1}}>
              <Text style={{fontWeight: '700'}}>{item.label}</Text>
              <Text style={{color: '#4B5563'}}>
                {item.line1}, {item.city} - {item.pincode}
              </Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={{padding: 24}}>
            <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
              Delivery slot
            </Text>
            <Pressable
              onPress={() => setSelectedSlot('Tomorrow, 8–11 AM')}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: selectedSlot === 'Tomorrow, 8–11 AM' ? '#E5F0FF' : '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                marginBottom: 12,
              }}>
              <Text style={{fontWeight: '600'}}>Tomorrow, 8–11 AM</Text>
            </Pressable>
            <Pressable
              onPress={() => setSelectedSlot('Tomorrow, 2–5 PM')}
              style={{
                padding: 12,
                borderRadius: 12,
                backgroundColor: selectedSlot === 'Tomorrow, 2–5 PM' ? '#E5F0FF' : '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                marginBottom: 12,
              }}>
              <Text style={{fontWeight: '600'}}>Tomorrow, 2–5 PM</Text>
            </Pressable>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                marginBottom: 16,
              }}>
              <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
                Payment method
              </Text>
              <RadioButton.Group
                onValueChange={value => setPaymentMethod(value as ClientPaymentMethod)}
                value={paymentMethod}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <RadioButton value="COD" />
                  <Text style={{fontWeight: '600'}}>Cash on Delivery (pay supplier at site)</Text>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <RadioButton value="UPI" />
                  <Text style={{fontWeight: '600'}}>UPI (online payment)</Text>
                </View>
              </RadioButton.Group>
              <Text style={{color: '#4B5563', marginTop: 6}}>
                UPI is in test mode – you may see a fake UPI app or link.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                marginBottom: 16,
              }}>
              <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
                Summary
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <Text style={{color: '#4B5563'}}>Items</Text>
                <Text style={{fontWeight: '700'}}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {upiStep?.active && (
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  marginBottom: 16,
                }}>
                <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 8}}>
                  Confirm UPI payment
                </Text>
                <Text style={{color: '#111827', marginBottom: 8}}>
                  We opened your UPI app with a payment request of ₹
                  {Number(upiStep.intent?.amount ?? 0).toFixed(2)}. After you complete the
                  payment, tap “I have paid” below.
                </Text>
                {paymentError && (
                  <Text style={{color: '#B91C1C', marginBottom: 8}}>{paymentError}</Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleConfirmUpiPaid}
                  loading={processingOrder}
                  disabled={processingOrder}
                  style={{marginBottom: 8}}>
                  I have paid
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setUpiStep(null)}
                  disabled={processingOrder}>
                  Cancel
                </Button>
              </View>
            )}

            {paymentError && !upiStep?.active && (
              <View style={{marginBottom: 12}}>
                <Text style={{color: '#B91C1C'}}>{paymentError}</Text>
              </View>
            )}

            {checkoutError && (
              <View style={{marginBottom: 12}}>
                <Text style={{color: '#B91C1C'}}>{checkoutError}</Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handlePlaceOrder}
              loading={processingOrder}
              disabled={
                processingOrder || !selectedAddressId || !selectedSlot || totalQuantity === 0
              }
              style={{paddingVertical: 4}}>
              {paymentMethod === 'COD' ? 'Place order' : 'Place order & pay via UPI'}
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  );
}
