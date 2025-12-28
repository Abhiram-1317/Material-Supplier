import React from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import AppText from '../ui/AppText';
import {appTheme} from '../../theme/theme';
import {MaterialProduct, Supplier} from '../../data/mockMaterials';

type MaterialCardProps = {
  product: MaterialProduct;
  supplier: Supplier;
  onPress?: () => void;
  fullWidth?: boolean;
};

const formatUnit = (unit: MaterialProduct['unit']) => {
  switch (unit) {
    case 'ton':
      return 'ton';
    case 'm3':
      return 'm³';
    case 'bag':
      return 'bag';
    case 'piece':
    default:
      return 'piece';
  }
};

export const MaterialCard: React.FC<MaterialCardProps> = ({product, supplier, onPress, fullWidth}) => {
  const priceLabel = `₹${product.pricePerUnit.toLocaleString('en-IN')} / ${formatUnit(product.unit)}`;
  const minOrderLabel = `Min order: ${product.minOrderQuantity} ${formatUnit(product.unit)}`;
  const leadTimeLabel = `Est. delivery in ${product.leadTimeHours}-${product.leadTimeHours + 2} hrs`;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        fullWidth ? styles.cardFullWidth : styles.cardDefaultWidth,
        pressed && styles.cardPressed,
      ]}
    >
      {product.imageUrl ? (
        <Image source={{uri: product.imageUrl}} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <MaterialCommunityIcons name="cube-outline" size={32} color={appTheme.colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        <AppText variant="subtitle" style={styles.title}>
          {product.name}
        </AppText>
        <AppText variant="body" color={appTheme.colors.textSecondary}>
          {supplier.name} • ★ {supplier.rating.toFixed(1)} ({supplier.totalRatings})
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="body" style={styles.price}>
            {priceLabel}
          </AppText>
          {product.grade ? (
            <AppText variant="caption" color={appTheme.colors.textSecondary}>
              {product.grade}
            </AppText>
          ) : null}
        </View>
        <AppText variant="caption" color={appTheme.colors.textSecondary}>
          {minOrderLabel}
        </AppText>
        <AppText variant="caption" color={appTheme.colors.success} style={styles.leadTime}>
          {leadTimeLabel}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: appTheme.elevations.raised,
  },
  cardDefaultWidth: {
    marginRight: appTheme.spacing.md,
    width: 260,
  },
  cardFullWidth: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.96,
  },
  image: {
    width: '100%',
    height: 130,
  },
  placeholder: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.background,
  },
  body: {
    padding: appTheme.spacing.md,
  },
  title: {
    marginBottom: appTheme.spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: appTheme.spacing.xs,
    marginBottom: appTheme.spacing.xs,
  },
  price: {
    fontWeight: '700',
  },
  leadTime: {
    marginTop: appTheme.spacing.xs,
  },
});

export default MaterialCard;
