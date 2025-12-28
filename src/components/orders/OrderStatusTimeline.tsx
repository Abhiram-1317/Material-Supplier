import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppText from '../ui/AppText';
import {appTheme} from '../../theme/theme';
import {Order} from '../../context/CartContext';

type Props = {
  status: Order['status'];
};

const STEPS: {key: Exclude<Order['status'], 'CANCELLED'>; title: string; subtitle: string}[] = [
  {key: 'PLACED', title: 'Order placed', subtitle: 'We received your order'},
  {key: 'ACCEPTED', title: 'Accepted by supplier', subtitle: 'Materials are being arranged'},
  {key: 'DISPATCHED', title: 'Out for delivery', subtitle: 'Vehicle is on the way'},
  {key: 'DELIVERED', title: 'Delivered at site', subtitle: 'Marked delivered'},
];

const OrderStatusTimeline: React.FC<Props> = ({status}) => {
  const currentIndex = status === 'CANCELLED'
    ? 0
    : Math.max(
        0,
        STEPS.findIndex(step => step.key === status),
      );

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex && status !== 'CANCELLED';
        const isCurrent = step.key === status;
        const dotColor = isCompleted || isCurrent ? appTheme.colors.primary : appTheme.colors.border;
        const lineColor = index < currentIndex && status !== 'CANCELLED'
          ? appTheme.colors.primary
          : appTheme.colors.border;

        return (
          <View key={step.key} style={styles.row}>
            <View style={styles.indicatorColumn}>
              <View style={[styles.dot, {backgroundColor: dotColor}]} />
              {index < STEPS.length - 1 && <View style={[styles.line, {backgroundColor: lineColor}]} />}
            </View>
            <View style={styles.textColumn}>
              <AppText variant="subtitle" style={styles.stepTitle}>
                {step.title}
              </AppText>
              <AppText variant="caption" color={appTheme.colors.textSecondary}>
                {step.subtitle}
              </AppText>
            </View>
          </View>
        );
      })}
      {status === 'CANCELLED' && (
        <View style={styles.cancelRow}>
          <View style={[styles.dot, {backgroundColor: appTheme.colors.error}]} />
          <AppText variant="body" style={styles.cancelText}>
            Order cancelled
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    rowGap: appTheme.spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  indicatorColumn: {
    width: 24,
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    paddingBottom: appTheme.spacing.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stepTitle: {
    marginBottom: appTheme.spacing.xs / 2,
  },
  cancelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: appTheme.spacing.sm,
  },
  cancelText: {
    color: appTheme.colors.error,
    fontWeight: '700',
  },
});

export default OrderStatusTimeline;
