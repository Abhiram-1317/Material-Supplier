import React, {useMemo, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Snackbar, IconButton, Divider} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {HomeStackParamList} from '../../navigation/AppTabsNavigator';
import {CATEGORIES, MATERIALS, SUPPLIERS} from '../../data/mockMaterials';
import {appTheme} from '../../theme/theme';
import {useCart} from '../../context/CartContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProductDetails'>;

const ProductDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {productId} = route.params;
  const {items, addItem, updateItemQuantity} = useCart();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {product, supplier} = useMemo(() => {
    const found = MATERIALS.find(m => m.id === productId) || null;
    const sup = found ? SUPPLIERS.find(s => s.id === found.supplierId) || null : null;
    return {product: found, supplier: sup};
  }, [productId]);

  const existing = useMemo(() => items.find(i => i.id === productId), [items, productId]);

  const [quantity, setQuantity] = useState(() => {
    if (existing) return existing.quantity;
    if (product) return product.minOrderQuantity;
    return 0;
  });

  if (!product || !supplier) {
    return (
      <ScreenContainer headerTitle="Product Details">
        <AppText variant="body">Product not found.</AppText>
      </ScreenContainer>
    );
  }

  const category = CATEGORIES.find(c => c.id === product.categoryId);
  const unitLabel = product.unit === 'm3' ? 'm³' : product.unit;
  const priceLabel = `₹${product.pricePerUnit.toLocaleString('en-IN')} / ${unitLabel}`;
  const leadTimeLabel = `Est. delivery in ${product.leadTimeHours}-${product.leadTimeHours + 2} hrs`;
  const total = product.pricePerUnit * quantity;
  const inCart = Boolean(existing);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(product.minOrderQuantity, q - 1));

  const handleAdd = () => {
    if (inCart) {
      updateItemQuantity(product.id, quantity);
    } else {
      addItem(product, supplier, quantity);
    }
    setSnackbarVisible(true);
  };

  const handleViewCart = () => {
    navigation.getParent()?.navigate('CartTab' as never);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIconBox}>
            <MaterialCommunityIcons name="cube-outline" size={32} color={appTheme.colors.surface} />
          </View>
          <AppText variant="caption" color={appTheme.colors.surface}>
            {category?.name || 'Material'} {product.grade ? `• ${product.grade}` : ''}
          </AppText>
          <AppText variant="title2" style={styles.heroTitle} color={appTheme.colors.surface}>
            {product.name}
          </AppText>
          <AppText variant="body" color={appTheme.colors.surface}>
            {priceLabel}
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.spacingSm}>
            Supplier
          </AppText>
          <View style={styles.supplierCard}>
            <View style={styles.supplierRow}>
              <AppText variant="body" style={styles.bold}>{supplier.name}</AppText>
              {supplier.isVerified ? (
                <View style={styles.verified}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={appTheme.colors.success} />
                  <AppText variant="caption" color={appTheme.colors.success}>
                    Verified supplier
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText variant="body" color={appTheme.colors.textSecondary}>
              ★ {supplier.rating.toFixed(1)} ({supplier.totalRatings}) • {supplier.distanceKm.toFixed(1)} km away
            </AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {supplier.city}
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.spacingSm}>
            Pricing & quantity
          </AppText>
          <View style={styles.rowBetween}>
            <AppText variant="body">{priceLabel}</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {leadTimeLabel}
            </AppText>
          </View>
          <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
            Min order: {product.minOrderQuantity} {unitLabel}
          </AppText>
          <View style={styles.qtyRow}>
            <AppText variant="body" style={styles.bold}>Quantity</AppText>
            <View style={styles.stepper}>
              <IconButton icon="minus" size={20} onPress={decrement} disabled={quantity <= product.minOrderQuantity} />
              <AppText variant="subtitle">{quantity}</AppText>
              <IconButton icon="plus" size={20} onPress={increment} />
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.rowBetween}>
            <AppText variant="subtitle">Total</AppText>
            <AppText variant="subtitle">₹{total.toLocaleString('en-IN')}</AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="subtitle" style={styles.spacingSm}>
            Material details
          </AppText>
          <AppText variant="body" color={appTheme.colors.textSecondary}>
            {product.description || 'High quality construction material from verified suppliers.'}
          </AppText>
          <AppText variant="subtitle" style={styles.spacingMd}>
            Usage & notes
          </AppText>
          <AppText variant="body" color={appTheme.colors.textSecondary}>
            • Ensure offloading space is ready at site.
          </AppText>
          <AppText variant="body" color={appTheme.colors.textSecondary}>
            • Delivery windows depend on site access and traffic.
          </AppText>
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <AppText variant="subtitle">Delivering to</AppText>
            <AppText variant="body" color={appTheme.colors.primary} onPress={() => Alert.alert('Change site', 'Site change coming soon')}>
              Change
            </AppText>
          </View>
          <AppText variant="body">Site 1 – Bengaluru</AppText>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            {quantity} {unitLabel}
          </AppText>
          <AppText variant="subtitle">₹{total.toLocaleString('en-IN')}</AppText>
        </View>
        <View style={styles.bottomActions}>
          <AppButton
            style={styles.addButton}
            onPress={handleAdd}
          >
            {inCart ? 'Update cart' : 'Add to cart'}
          </AppButton>
          {inCart ? (
            <AppText variant="caption" color={appTheme.colors.primary} onPress={handleViewCart}>
              View cart
            </AppText>
          ) : null}
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{label: 'Cart', onPress: handleViewCart}}
      >
        Added to cart
      </Snackbar>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
  },
  hero: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.lg,
    marginBottom: appTheme.spacing.lg,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: appTheme.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appTheme.spacing.sm,
  },
  heroTitle: {
    marginTop: appTheme.spacing.xs,
    marginBottom: appTheme.spacing.xs,
  },
  section: {
    marginBottom: appTheme.spacing.lg,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingMd: {
    marginVertical: appTheme.spacing.sm,
  },
  supplierCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.xs,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: appTheme.spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: appTheme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: appTheme.spacing.xs,
  },
  divider: {
    marginVertical: appTheme.spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appTheme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomActions: {
    alignItems: 'flex-end',
  },
  addButton: {
    minWidth: 160,
  },
});

export default ProductDetailsScreen;
