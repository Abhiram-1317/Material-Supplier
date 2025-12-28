import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Chip} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {OrdersStackParamList} from '../../navigation/AppTabsNavigator';
import {appTheme} from '../../theme/theme';
import {fetchOrders, type ApiOrder, type ApiOrderStatus} from '../../api/orders';

const statusColors: Record<ApiOrderStatus, string> = {
  PLACED: appTheme.colors.textSecondary,
  ACCEPTED: appTheme.colors.primary,
  DISPATCHED: appTheme.colors.secondary,
  DELIVERED: appTheme.colors.success,
  CANCELLED: appTheme.colors.error,
};

const OrdersListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await fetchOrders();
        if (!isMounted) return;
        setOrders(data);
        setError(undefined);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load orders');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );

  const renderStatusChip = (status: ApiOrderStatus) => (
    <Chip
      mode="flat"
      style={[styles.statusChip, {backgroundColor: statusColors[status]}]}
      textStyle={styles.statusChipText}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Chip>
  );

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={72} color={appTheme.colors.textSecondary} />
      <AppText variant="title2" style={styles.spacingMd}>No orders yet</AppText>
      <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
        Place your first material order for your Warangal or Hanumakonda site.
      </AppText>
      <AppButton onPress={() => navigation.getParent()?.navigate('HomeTab' as never)}>Browse materials</AppButton>
    </View>
  );

  const renderItem = ({item}: {item: ApiOrder}) => {
    const itemsCount = item.items.reduce((sum, line) => sum + line.quantity, 0);
    return (
      <Pressable
        style={({pressed}) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate('OrderDetails', {orderId: item.id})}
      >
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {item.orderCode || item.id}
            </AppText>
            <AppText variant="body" style={styles.spacingXs}>{formatDateTime(item.createdAt)}</AppText>
          </View>
          {renderStatusChip(item.status)}
        </View>

        <View style={styles.spacingSm}>
          <AppText variant="body" style={styles.bold}>
            {item.site.label} - {item.site.addressLine}
          </AppText>
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            Slot: {item.scheduledSlot}
          </AppText>
        </View>

        <View style={styles.rowBetween}>
          <AppText variant="body" color={appTheme.colors.textSecondary}>
            {itemsCount} items
          </AppText>
          <AppText variant="subtitle">Total: ₹{Number(item.totalAmount).toLocaleString('en-IN')}</AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer headerTitle="Orders">
      {loading && (
        <View style={{paddingVertical: appTheme.spacing.md}}>
          <ActivityIndicator />
        </View>
      )}
      {error && !loading ? (
        <AppText variant="body" color={appTheme.colors.error} style={styles.spacingMd}>
          {error}
        </AppText>
      ) : null}
      <FlatList
        data={sortedOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={sortedOrders.length ? styles.listContent : styles.listEmpty}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: appTheme.spacing.md}} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: appTheme.spacing.xl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: appTheme.spacing.xl,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    rowGap: appTheme.spacing.xs,
  },
  cardPressed: {
    transform: [{scale: 0.995}],
    opacity: 0.96,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  spacingMd: {
    marginBottom: appTheme.spacing.md,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingXs: {
    marginTop: appTheme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.xl,
    rowGap: appTheme.spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
});

export default OrdersListScreen;
