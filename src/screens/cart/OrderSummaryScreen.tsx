import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {appTheme} from '../../theme/theme';
import {CartStackParamList} from '../../navigation/AppTabsNavigator';
import {fetchOrderById, type ApiOrder} from '../../api/orders';

type Props = NativeStackScreenProps<CartStackParamList, 'OrderSummary'>;

const OrderSummaryScreen: React.FC<Props> = ({route, navigation}) => {
  const {orderId, orderCode} = route.params;
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (!isMounted) return;
        setOrder(data);
        setError(undefined);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load order');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!order) {
    return (
      <ScreenContainer headerTitle="Order placed">
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <AppText variant="body" style={styles.spacing}>
              {error || 'Order not found.'}
            </AppText>
            <AppButton onPress={() => navigation.getParent()?.navigate('HomeTab' as never)}>
              Back to home
            </AppButton>
          </>
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable headerTitle="Order placed">
      <View style={styles.successIcon}>
        <MaterialCommunityIcons name="check-circle" size={64} color={appTheme.colors.success} />
      </View>
      <AppText variant="title2" style={styles.spacing}>Order placed successfully</AppText>
      <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.spacing}>
        Order ID: {order.orderCode || orderCode || order.id}
      </AppText>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingXs}>Delivery details</AppText>
        <AppText variant="body">{order.site.label}</AppText>
        <AppText variant="caption" color={appTheme.colors.textSecondary}>
          {order.site.addressLine}
        </AppText>
        <AppText variant="body" style={styles.spacing}>Slot: {order.scheduledSlot}</AppText>
        <AppText variant="body">Payment: Cash on Delivery</AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingXs}>Items</AppText>
        {order.items.map(item => (
          <View key={item.id} style={styles.rowBetween}>
            <AppText variant="body">{item.product.name}</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              x{item.quantity}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <AppText variant="body">Items total</AppText>
          <AppText variant="body">₹{Number(order.totalAmount).toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Delivery charges</AppText>
          <AppText variant="body">₹{Number(order.deliveryFee).toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Status</AppText>
          <AppText variant="body">{order.status}</AppText>
        </View>
      </View>

      <AppButton
        style={styles.primaryBtn}
        onPress={() => {
          const parent = navigation.getParent();
          parent?.navigate(
            'OrdersTab' as never,
            {screen: 'OrderDetails', params: {orderId: order.id}} as never,
          );
        }}
      >
        Track order
      </AppButton>
      <AppButton
        variant="secondary"
        onPress={() => navigation.getParent()?.navigate('HomeTab' as never)}
      >
        Back to home
      </AppButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  spacing: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingXs: {
    marginBottom: appTheme.spacing.xs,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: appTheme.spacing.sm,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    marginBottom: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    rowGap: appTheme.spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryBtn: {
    marginTop: appTheme.spacing.md,
    marginBottom: appTheme.spacing.sm,
  },
});

export default OrderSummaryScreen;
