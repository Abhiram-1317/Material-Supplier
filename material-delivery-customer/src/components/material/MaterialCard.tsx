import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Chip, Text, useTheme} from 'react-native-paper';

import {type ApiProduct, type ApiUnit} from '../../api/catalog';

const UNIT_LABELS: Record<ApiUnit, string> = {
  TON: 'ton',
  M3: 'm3',
  BAG: 'bag',
  PIECE: 'piece',
};

export function MaterialCard({
  product,
  onPress,
}: {
  product: ApiProduct;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const hasImage = Boolean(product.imageUrl);
  const initial = product.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Card style={styles.card} mode="elevated" onPress={onPress}>
      {hasImage ? (
        <Card.Cover source={{uri: product.imageUrl as string}} style={styles.cover} />
      ) : (
        <View
          style={[
            styles.cover,
            styles.placeholder,
            {backgroundColor: theme.colors.surfaceVariant},
          ]}>
          <Text variant="headlineMedium" style={{color: theme.colors.onSurfaceVariant}}>
            {initial}
          </Text>
        </View>
      )}
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text variant="bodySmall" style={styles.subline} numberOfLines={1}>
          {product.supplier.companyName}
        </Text>
        <View style={styles.metaRow}>
          <Chip icon="map-marker" compact>
            {product.city.name}
          </Chip>
          <Chip icon="clock-outline" compact style={styles.chip}>
            {product.leadTimeHours}h ETA
          </Chip>
        </View>
        <View style={styles.priceRow}>
          <Text variant="titleMedium" style={styles.price}>
            ₹{Number(product.basePrice).toLocaleString('en-IN')} / {UNIT_LABELS[product.unit]}
          </Text>
          <Text variant="bodySmall" style={styles.minOrder}>
            Min {product.minOrderQty} {UNIT_LABELS[product.unit]}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  cover: {
    height: 140,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 12,
  },
  title: {
    fontWeight: '700',
    color: '#0F172A',
  },
  subline: {
    color: '#475569',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chip: {
    marginLeft: 8,
  },
  priceRow: {
    marginTop: 12,
  },
  price: {
    fontWeight: '700',
    color: '#111827',
  },
  minOrder: {
    marginTop: 2,
    color: '#6B7280',
  },
});

export default MaterialCard;
