import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppText from '../ui/AppText';
import {appTheme} from '../../theme/theme';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <AppText variant="title2">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel ? (
        <AppText
          variant="body"
          color={appTheme.colors.primary}
          onPress={onActionPress}
          style={styles.action}
        >
          {actionLabel}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: appTheme.spacing.md,
    marginTop: appTheme.spacing.lg,
  },
  left: {
    flex: 1,
  },
  action: {
    marginLeft: appTheme.spacing.md,
  },
});

export default SectionHeader;
