import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {IconButton, Divider} from 'react-native-paper';
import {appTheme} from '../../theme/theme';
import AppText from './AppText';

type Props = {
  children: React.ReactNode;
  scrollable?: boolean;
  headerTitle?: string;
  onBackPress?: () => void;
  rightAccessory?: React.ReactNode;
};

export const ScreenContainer: React.FC<Props> = ({
  children,
  scrollable = false,
  headerTitle,
  onBackPress,
  rightAccessory,
}) => {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {headerTitle ? (
        <View style={styles.header}>
          {onBackPress ? (
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={onBackPress}
              accessibilityLabel="Go back"
            />
          ) : (
            <View style={styles.headerSpacer} />
          )}
          <AppText variant="subtitle" style={styles.headerTitle}>
            {headerTitle}
          </AppText>
          <View style={styles.headerSpacer}>{rightAccessory}</View>
        </View>
      ) : null}
      {headerTitle ? <Divider /> : null}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: appTheme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.sm,
    backgroundColor: appTheme.colors.surface,
  },
  headerSpacer: {
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
});

export default ScreenContainer;
