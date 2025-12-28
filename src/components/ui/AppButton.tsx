import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, ButtonProps} from 'react-native-paper';
import {appTheme} from '../../theme/theme';

type Variant = 'primary' | 'secondary';

type Props = Omit<ButtonProps, 'mode'> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export const AppButton: React.FC<Props> = ({
  variant = 'primary',
  fullWidth = true,
  style,
  ...rest
}) => {
  const isPrimary = variant === 'primary';
  const mode = isPrimary ? 'contained' : 'outlined';

  return (
    <Button
      mode={mode}
      style={[fullWidth ? styles.fullWidth : undefined, style]}
      contentStyle={styles.content}
      buttonColor={isPrimary ? appTheme.colors.primary : undefined}
      textColor={isPrimary ? appTheme.colors.surface : appTheme.colors.textPrimary}
      rippleColor={appTheme.colors.primaryDark}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: appTheme.spacing.sm,
  },
});

export default AppButton;
