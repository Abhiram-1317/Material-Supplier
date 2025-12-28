import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {List, Switch} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';
import {useUserProfile} from '../../context/UserProfileContext';
import {appTheme} from '../../theme/theme';

const SettingsScreen: React.FC = () => {
  const {profile, updateProfile} = useUserProfile();
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [gstNumber, setGstNumber] = useState(profile.gstNumber || '');
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        companyName: companyName.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
      });
      Alert.alert('Profile updated', 'Your details have been saved.');
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile');
    }
  };

  return (
    <ScreenContainer scrollable headerTitle="Settings">
      <AppText variant="subtitle" style={styles.sectionTitle}>Profile</AppText>
      <AppTextInput
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Your name"
        style={styles.spacingSm}
      />
      <AppTextInput
        label="Company name"
        value={companyName}
        onChangeText={setCompanyName}
        placeholder="Construction Co."
        style={styles.spacingSm}
      />
      <AppTextInput
        label="GST number"
        value={gstNumber}
        onChangeText={setGstNumber}
        placeholder="12ABCDE3456F7Z8"
        style={styles.spacingLg}
      />

      <AppButton onPress={handleSave} style={styles.spacingLg}>
        Save changes
      </AppButton>

      <AppText variant="subtitle" style={styles.sectionTitle}>Preferences</AppText>
      <List.Item
        title="Order updates notifications"
        description="Get status updates for your orders"
        right={() => <Switch value={orderUpdates} onValueChange={setOrderUpdates} color={appTheme.colors.primary} />}
      />
      <List.Item
        title="Promotional notifications"
        description="Offers and marketing updates"
        right={() => <Switch value={promoNotifications} onValueChange={setPromoNotifications} color={appTheme.colors.primary} />}
      />
      <List.Item
        title="Language"
        description="English"
        onPress={() => Alert.alert('Coming soon', 'Language selection will be available soon.')}
        right={() => <List.Icon icon="chevron-right" />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: appTheme.spacing.sm,
    marginTop: appTheme.spacing.lg,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingLg: {
    marginBottom: appTheme.spacing.lg,
  },
});

export default SettingsScreen;
