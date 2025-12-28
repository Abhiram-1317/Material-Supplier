import React, {useMemo} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {IconButton, Divider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {useCart} from '../../context/CartContext';
import {appTheme} from '../../theme/theme';
import {CartStackParamList} from '../../navigation/AppTabsNavigator';

const deliveryCharge = 250;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
  const {items, subtotal, updateItemQuantity, removeItem} = useCart();

  const tax = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = subtotal + (items.length ? deliveryCharge : 0) + (items.length ? tax : 0);

  if (!items.length) {
    return (
      <ScreenContainer headerTitle="Cart">
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="truck-delivery" size={64} color={appTheme.colors.textSecondary} />
          <AppText variant="title2" style={styles.emptyTitle}>Your cart is empty</AppText>
          <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.emptySubtitle}>
            Add materials to get started with your site delivery.
          </AppText>
          <AppButton onPress={() => navigation.getParent()?.navigate('HomeTab' as never)}>
            Browse materials
          </AppButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer headerTitle="Cart">
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{height: appTheme.spacing.md}} />}
        renderItem={({item}) => {
          const lineTotal = item.product.pricePerUnit * item.quantity;
          const unitLabel = item.product.unit === 'm3' ? 'm³' : item.product.unit;
          return (
            <View style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <View style={{flex: 1}}>
                  <AppText variant="subtitle">{item.product.name}</AppText>
                  <AppText variant="body" color={appTheme.colors.textSecondary}>
                    {item.supplier.name}
                  </AppText>
                </View>
                <IconButton
                  icon="trash-can-outline"
                  size={20}
                  onPress={() => removeItem(item.id)}
                />
              </View>
              <AppText variant="caption" color={appTheme.colors.textSecondary}>
                ₹{item.product.pricePerUnit.toLocaleString('en-IN')} / {unitLabel}
              </AppText>
              <View style={styles.rowBetween}>
                <View style={styles.stepper}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                  />
                  <AppText variant="subtitle">{item.quantity}</AppText>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                  />
                </View>
                <AppText variant="subtitle">₹{lineTotal.toLocaleString('en-IN')}</AppText>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <View style={styles.rowBetween}>
              <AppText variant="body">Subtotal</AppText>
              <AppText variant="body">₹{subtotal.toLocaleString('en-IN')}</AppText>
            </View>
            <View style={styles.rowBetween}>
              <AppText variant="body">Estimated delivery charges</AppText>
              <AppText variant="body">₹{deliveryCharge.toLocaleString('en-IN')}</AppText>
            </View>
            <View style={styles.rowBetween}>
              <AppText variant="body">Approx taxes (18%)</AppText>
              <AppText variant="body">₹{tax.toLocaleString('en-IN')}</AppText>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.rowBetween}>
              <AppText variant="subtitle">Total payable</AppText>
              <AppText variant="subtitle">₹{total.toLocaleString('en-IN')}</AppText>
            </View>
            <AppButton style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
              Proceed to checkout
            </AppButton>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: appTheme.spacing.xxl,
  },
  itemCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: appTheme.elevations.card,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: appTheme.spacing.xs,
  },
  summaryCard: {
    marginTop: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    rowGap: appTheme.spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: appTheme.elevations.card,
  },
  divider: {
    marginVertical: appTheme.spacing.xs,
  },
  checkoutBtn: {
    marginTop: appTheme.spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: appTheme.spacing.sm,
    paddingTop: appTheme.spacing.xl,
  },
  emptyTitle: {
    marginTop: appTheme.spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: appTheme.spacing.lg,
  },
});

export default CartScreen;
