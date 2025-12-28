import React from 'react';
import {StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {appTheme} from '../../theme/theme';
import AppText from '../ui/AppText';
import AppButton from '../ui/AppButton';
import {Address} from '../../context/UserProfileContext';

type Props = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
};

const AddressCard: React.FC<Props> = ({address, onEdit, onDelete, onSetDefault}) => {
  return (
    <View style={[styles.card, address.isDefault && styles.cardHighlighted]}>
      <View style={styles.rowBetween}>
        <View style={{flex: 1}}>
          <AppText variant="body" style={styles.bold}>{address.label}</AppText>
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            {address.city} - {address.pincode}
          </AppText>
          <AppText variant="body" style={styles.spacingXs}>
            {address.line1}
          </AppText>
          {address.line2 ? (
            <AppText variant="caption" color={appTheme.colors.textSecondary}>{address.line2}</AppText>
          ) : null}
          {address.contactName ? (
            <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.spacingXs}>
              Contact: {address.contactName}
              {address.contactPhone ? ` | ${address.contactPhone}` : ''}
            </AppText>
          ) : null}
        </View>
        {address.isDefault ? (
          <View style={styles.defaultBadge}>
            <AppText variant="caption" style={styles.defaultText}>Default</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.rowBetween}>
        {!address.isDefault && onSetDefault ? (
          <AppButton variant="secondary" onPress={onSetDefault} fullWidth={false}>
            Set as default
          </AppButton>
        ) : null}
        <View style={styles.actions}>
          <AppButton variant="secondary" onPress={onEdit} style={styles.actionBtn} fullWidth={false}>
            Edit
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={onDelete}
            style={styles.actionBtn}
            icon={<MaterialCommunityIcons name="delete-outline" size={18} color={appTheme.colors.textPrimary} />}
            fullWidth={false}
          >
            Delete
          </AppButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    rowGap: appTheme.spacing.sm,
  },
  cardHighlighted: {
    borderColor: appTheme.colors.primary,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bold: {
    fontWeight: '700',
  },
  spacingXs: {
    marginTop: appTheme.spacing.xs,
  },
  defaultBadge: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radii.md,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs,
  },
  defaultText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    columnGap: appTheme.spacing.sm,
  },
  actionBtn: {
    paddingHorizontal: appTheme.spacing.sm,
  },
});

export default AddressCard;
