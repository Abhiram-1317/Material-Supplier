import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Divider} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {OrdersStackParamList} from '../../navigation/AppTabsNavigator';
import {appTheme} from '../../theme/theme';
import OrderStatusTimeline from '../../components/orders/OrderStatusTimeline';
import {fetchOrderById, type ApiOrder, type ApiOrderStatus} from '../../api/orders';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetails'>;

const statusColors: Record<ApiOrderStatus, string> = {
  PLACED: appTheme.colors.textSecondary,
  ACCEPTED: appTheme.colors.primary,
  DISPATCHED: appTheme.colors.secondary,
  DELIVERED: appTheme.colors.success,
  CANCELLED: appTheme.colors.error,
};

const OrderDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {orderId} = route.params;
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

  const renderStatusChip = (status: ApiOrderStatus) => (
    <View style={[styles.chip, {backgroundColor: statusColors[status]}]}>
      <AppText variant="caption" style={styles.chipText}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </AppText>
    </View>
  );

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (!order) {
    return (
      <ScreenContainer headerTitle="Order details">
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <AppText variant="body" style={styles.spacingMd}>{error || 'Order not found.'}</AppText>
            <AppButton onPress={() => navigation.goBack()}>Back to orders</AppButton>
          </>
        )}
      </ScreenContainer>
    );
  }

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.totalPrice || 0),
    0,
  );
  const deliveryFee = Number(order.deliveryFee);
  const tax = Number(order.taxAmount);
  const computedTotal = Number(order.totalAmount);

  return (
    <ScreenContainer scrollable headerTitle="Order details">
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="body" style={styles.bold}>{order.orderCode || order.id}</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {formatDateTime(order.createdAt)}
            </AppText>
          </View>
          {renderStatusChip(order.status)}
        </View>
        <Divider style={styles.divider} />
        <View style={styles.rowBetween}>
          <AppText variant="body" color={appTheme.colors.textSecondary}>Payment</AppText>
          <AppText variant="body">Cash on Delivery</AppText>
        </View>
      </View>

      <OrderStatusTimeline status={order.status} />

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Delivery details</AppText>
        <AppText variant="body" style={styles.bold}>{order.site.label}</AppText>
        <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
          {order.site.addressLine}
        </AppText>
        <AppText variant="body">Slot: {order.scheduledSlot}</AppText>
        <AppText variant="body" color={appTheme.colors.textSecondary}>
          City: {order.site.city.name} - {order.site.pincode}
        </AppText>
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Items</AppText>
        {order.items.map(item => (
          <View key={item.id} style={styles.rowBetween}>
            <View style={styles.flex1}>
              <AppText variant="body" style={styles.bold}>{item.product.name}</AppText>
              <AppText variant="caption" color={appTheme.colors.textSecondary}>
                Qty: {item.quantity} {item.product.unit}
              </AppText>
            </View>
            <AppText variant="body">
              ₹{Number(item.totalPrice).toLocaleString('en-IN')}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Price summary</AppText>
        <View style={styles.rowBetween}>
          <AppText variant="body">Subtotal</AppText>
          <AppText variant="body">₹{itemsSubtotal.toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Delivery charges</AppText>
          <AppText variant="body">₹{deliveryFee.toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="body">Taxes (18%)</AppText>
          <AppText variant="body">₹{tax.toLocaleString('en-IN')}</AppText>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.rowBetween}>
          <AppText variant="subtitle">Total payable</AppText>
          <AppText variant="subtitle">₹{computedTotal.toLocaleString('en-IN')}</AppText>
        </View>
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Need help?</AppText>
        <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
          For changes or issues with this order, contact support.
        </AppText>
        <View style={styles.rowGapSm}>
          <AppButton
            onPress={() => Alert.alert('Support', 'Call +91-9876543210')}
            style={styles.spacingXs}
          >
            Call support
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => Alert.alert('Support', 'WhatsApp us at +91-9876543210')}
          >
            WhatsApp us
          </AppButton>
        </View>
        <AppButton
          variant="secondary"
          style={styles.spacingSm}
          onPress={() => Alert.alert('Invoice', 'Download invoice coming soon')}
        >
          Download invoice
        </AppButton>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    marginBottom: appTheme.spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: appTheme.spacing.sm,
  },
  flex1: {
    flex: 1,
    paddingRight: appTheme.spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingMd: {
    marginBottom: appTheme.spacing.md,
  },
  spacingXs: {
    marginTop: appTheme.spacing.xs,
  },
  divider: {
    marginVertical: appTheme.spacing.sm,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs / 2,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowGapSm: {
    rowGap: appTheme.spacing.sm,
  },
});

export default OrderDetailsScreen;
