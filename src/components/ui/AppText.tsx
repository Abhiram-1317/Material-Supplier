import React from 'react';
import {Text, TextProps, StyleSheet} from 'react-native';
import {appTheme} from '../../theme/theme';

export type AppTextVariant = 'title1' | 'title2' | 'subtitle' | 'body' | 'caption';

type Props = TextProps & {
  variant?: AppTextVariant;
  color?: string;
  children: React.ReactNode;
};

const variantMap: Record<AppTextVariant, typeof appTheme.typography.body> = {
  title1: appTheme.typography.title1,
  title2: appTheme.typography.title2,
  subtitle: appTheme.typography.subtitle,
  body: appTheme.typography.body,
  caption: appTheme.typography.caption,
};

export const AppText: React.FC<Props> = ({
  variant = 'body',
  style,
  color,
  children,
  ...rest
}) => {
  const baseStyle = variantMap[variant];
  return (
    <Text
      {...rest}
      style={[
        styles.text,
        baseStyle,
        color ? {color} : null,
        style,
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: appTheme.colors.textPrimary,
  },
});

export default AppText;
