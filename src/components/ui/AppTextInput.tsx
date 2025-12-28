import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput, TextInputProps} from 'react-native-paper';
import {appTheme} from '../../theme/theme';
import AppText from './AppText';

type Props = TextInputProps & {
  errorText?: string;
};

export const AppTextInput: React.FC<Props> = ({errorText, style, ...rest}) => {
  const hasError = Boolean(errorText);
  return (
    <View>
      <TextInput
        mode="outlined"
        style={[styles.input, style]}
        outlineColor={appTheme.colors.border}
        activeOutlineColor={appTheme.colors.primary}
        textColor={appTheme.colors.textPrimary}
        theme={{
          colors: {
            primary: appTheme.colors.primary,
            error: appTheme.colors.error,
          },
        }}
        {...rest}
        error={hasError}
      />
      {hasError ? (
        <AppText variant="caption" color={appTheme.colors.error} style={styles.errorText}>
          {errorText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: appTheme.colors.surface,
  },
  errorText: {
    marginTop: appTheme.spacing.xs,
  },
});

export default AppTextInput;
