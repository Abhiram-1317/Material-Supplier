import React, {useEffect, useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RadioButton, Divider} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {useCart} from '../../context/CartContext';
import {appTheme} from '../../theme/theme';
import {CartStackParamList} from '../../navigation/AppTabsNavigator';
import {useLocation} from '../../context/LocationContext';
import {useUserProfile, Address} from '../../context/UserProfileContext';

const deliveryCharge = 250;

const timeSlots = ['8–11 AM', '11 AM–2 PM', '2–5 PM'];

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
  const {items, subtotal, placeOrder} = useCart();
  const {currentCity} = useLocation();
  const {addresses, getDefaultAddress} = useUserProfile();

  const cityAddresses = useMemo(
    () => addresses.filter(a => a.city === currentCity),
    [addresses, currentCity],
  );

  const initialAddress = useMemo(() => {
    const def = getDefaultAddress();
    if (def && def.city === currentCity) return def;
    return cityAddresses[0];
  }, [cityAddresses, currentCity, getDefaultAddress]);

  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(initialAddress);

  useEffect(() => {
    setSelectedAddress(initialAddress);
  }, [initialAddress]);
  const [day, setDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [slot, setSlot] = useState<string>(timeSlots[0]);

  const tax = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = subtotal + (items.length ? deliveryCharge : 0) + (items.length ? tax : 0);

  if (!items.length) {
    return (
      <ScreenContainer headerTitle="Checkout">
        <View style={styles.empty}>
          <AppText variant="body">Your cart is empty.</AppText>
          <AppButton style={styles.emptyBtn} onPress={() => navigation.goBack()}>
            Back to cart
          </AppButton>
        </View>
      </ScreenContainer>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !slot) {
      Alert.alert('Select details', 'Please choose address and delivery slot.');
      return;
    }

    try {
      const order = await placeOrder({
        siteId: selectedAddress.id,
        deliverySlot: `${day}, ${slot}`,
      });

      if (!order) {
        Alert.alert('Cart is empty', 'Add items before placing an order.');
        return;
      }

      navigation.replace('OrderSummary', {
        orderId: order.id,
        orderCode: order.orderCode,
      });
    } catch (error) {
      Alert.alert('Order failed', 'Unable to place order. Please try again.');
    }
  };

  return (
    <ScreenContainer scrollable headerTitle="Checkout">
      <View style={styles.section}>
        <AppText variant="title2" style={styles.sectionTitle}>Delivery address</AppText>

        {!cityAddresses.length ? (
          <View style={styles.emptyAddresses}>
            <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
              No saved addresses for {currentCity}.
            </AppText>
            <AppButton
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate('ProfileTab' as never, {screen: 'AddressList'} as never)
              }
              variant="primary"
            >
              Add address
            </AppButton>
          </View>
        ) : (
          <RadioButton.Group
            onValueChange={value => {
              const addr = cityAddresses.find(a => a.id === value);
              if (addr) setSelectedAddress(addr);
            }}
            value={selectedAddress?.id}
          >
            {cityAddresses.map(addr => (
              <View key={addr.id} style={styles.cardRow}>
                <RadioButton value={addr.id} />
                <View style={{flex: 1}}>
                  <AppText variant="body" style={styles.bold}>{addr.label}</AppText>
                  <AppText variant="caption" color={appTheme.colors.textSecondary}>
                    {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}
                  </AppText>
                  <AppText variant="caption" color={appTheme.colors.textSecondary}>
                    {addr.city} - {addr.pincode}
                  </AppText>
                  {addr.contactPhone ? (
                    <AppText variant="caption" color={appTheme.colors.textSecondary}>
                      {addr.contactName ? `${addr.contactName} | ` : ''}{addr.contactPhone}
                    </AppText>
                  ) : null}
                </View>
              </View>
            ))}
          </RadioButton.Group>
        )}
      </View>

      <View style={styles.section}>
        <AppText variant="title2" style={styles.sectionTitle}>Delivery slot</AppText>
        <View style={styles.chipRow}>
          {(['Today', 'Tomorrow'] as const).map(option => (
            <AppButton
              key={option}
              variant={day === option ? 'primary' : 'secondary'}
              onPress={() => setDay(option)}
              style={styles.chip}
            >
              {option}
            </AppButton>
          ))}
        </View>
        <View style={styles.chipRow}>
          {timeSlots.map(time => (
            <AppButton
              key={time}
              variant={slot === time ? 'primary' : 'secondary'}
              onPress={() => setSlot(time)}
              style={styles.chip}
            >
              {time}
            </AppButton>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="title2" style={styles.sectionTitle}>Payment method</AppText>
        <RadioButton.Group onValueChange={() => {}} value="COD">
          <View style={styles.cardRow}>
            <RadioButton value="COD" />
            <View>
              <AppText variant="body" style={styles.bold}>Cash on Delivery</AppText>
              <AppText variant="caption" color={appTheme.colors.textSecondary}>
                Pay directly to supplier at delivery.
              </AppText>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      <View style={styles.section}>
        <AppText variant="title2" style={styles.sectionTitle}>Price summary</AppText>
        <View style={styles.rowBetween}>
          <AppText variant="body">Subtotal</AppText>
          <AppText variant="body">₹{subtotal.toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Delivery charges</AppText>
          <AppText variant="body">₹{deliveryCharge.toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Taxes (18%)</AppText>
          <AppText variant="body">₹{tax.toLocaleString('en-IN')}</AppText>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.rowBetween}>
          <AppText variant="subtitle">Total payable</AppText>
          <AppText variant="subtitle">₹{total.toLocaleString('en-IN')}</AppText>
        </View>
      </View>

      <AppButton style={styles.placeOrderBtn} onPress={handlePlaceOrder} disabled={!cityAddresses.length}>
        Place order
      </AppButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: appTheme.spacing.lg,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: appTheme.spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: appTheme.spacing.xs,
  },
  bold: {
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: appTheme.spacing.sm,
    rowGap: appTheme.spacing.sm,
    marginBottom: appTheme.spacing.sm,
  },
  chip: {
    minWidth: 120,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: appTheme.spacing.xs,
  },
  divider: {
    marginVertical: appTheme.spacing.xs,
  },
  placeOrderBtn: {
    marginTop: appTheme.spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: appTheme.spacing.sm,
  },
  emptyBtn: {
    marginTop: appTheme.spacing.sm,
  },
  emptyAddresses: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.md,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
});

export default CheckoutScreen;
