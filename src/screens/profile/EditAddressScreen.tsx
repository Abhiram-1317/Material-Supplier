import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Switch} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';
import {ProfileStackParamList} from '../../navigation/AppTabsNavigator';
import {useUserProfile, AddressInput} from '../../context/UserProfileContext';
import {useLocation} from '../../context/LocationContext';
import {appTheme} from '../../theme/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditAddress'>;

const EditAddressScreen: React.FC<Props> = ({route, navigation}) => {
  const {addressId} = route.params || {};
  const {addresses, addOrUpdateAddress, setDefaultAddress} = useUserProfile();
  const {currentCity} = useLocation();

  const editingAddress = useMemo(
    () => addresses.find(a => a.id === addressId),
    [addresses, addressId],
  );

  const [label, setLabel] = useState(editingAddress?.label || '');
  const [city, setCity] = useState(editingAddress?.city || currentCity);
  const [line1, setLine1] = useState(editingAddress?.line1 || '');
  const [line2, setLine2] = useState(editingAddress?.line2 || '');
  const [pincode, setPincode] = useState(editingAddress?.pincode || '');
  const [contactName, setContactName] = useState(editingAddress?.contactName || '');
  const [contactPhone, setContactPhone] = useState(editingAddress?.contactPhone || '');
  const [makeDefault, setMakeDefault] = useState<boolean>(editingAddress?.isDefault ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!label.trim()) nextErrors.label = 'Label is required';
    if (!city) nextErrors.city = 'City is required';
    if (!line1.trim()) nextErrors.line1 = 'Address line 1 is required';
    if (!pincode.trim()) nextErrors.pincode = 'Pincode is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const input: AddressInput = {
      id: addressId,
      label: label.trim(),
      city,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      pincode: pincode.trim(),
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      isDefault: makeDefault,
    };

    try {
      const saved = await addOrUpdateAddress(input);
      if (makeDefault) {
        await setDefaultAddress(saved.id);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Unable to save address');
    }
  };

  return (
    <ScreenContainer headerTitle={editingAddress ? 'Edit address' : 'Add address'} scrollable>
      <AppTextInput
        label="Label"
        placeholder="Site 1 - Main Site"
        value={label}
        onChangeText={setLabel}
        errorText={errors.label}
        style={styles.spacingSm}
      />

      <AppText variant="body" style={styles.spacingXs}>City</AppText>
      <View style={styles.cityRow}>
        {(['Warangal', 'Hanumakonda'] as const).map(option => (
          <AppButton
            key={option}
            variant={city === option ? 'primary' : 'secondary'}
            onPress={() => setCity(option)}
            style={styles.cityChip}
          >
            {option}
          </AppButton>
        ))}
      </View>
      {errors.city ? (
        <AppText variant="caption" color={appTheme.colors.error} style={styles.spacingSm}>
          {errors.city}
        </AppText>
      ) : null}

      <AppTextInput
        label="Address line 1"
        placeholder="Street, landmark"
        value={line1}
        onChangeText={setLine1}
        errorText={errors.line1}
        style={styles.spacingSm}
      />
      <AppTextInput
        label="Address line 2"
        placeholder="Area / block (optional)"
        value={line2}
        onChangeText={setLine2}
        style={styles.spacingSm}
      />
      <AppTextInput
        label="Pincode"
        placeholder="506002"
        keyboardType="number-pad"
        value={pincode}
        onChangeText={setPincode}
        errorText={errors.pincode}
        style={styles.spacingSm}
      />
      <AppTextInput
        label="Contact name"
        placeholder="Site supervisor"
        value={contactName}
        onChangeText={setContactName}
        style={styles.spacingSm}
      />
      <AppTextInput
        label="Contact phone"
        placeholder="+91-"
        keyboardType="phone-pad"
        value={contactPhone}
        onChangeText={setContactPhone}
        style={styles.spacingSm}
      />

      <View style={styles.switchRow}>
        <View>
          <AppText variant="body" style={styles.bold}>Set as default</AppText>
          <AppText variant="caption" color={appTheme.colors.textSecondary}>
            Use this address for checkout by default.
          </AppText>
        </View>
        <Switch value={makeDefault} onValueChange={setMakeDefault} color={appTheme.colors.primary} />
      </View>

      <AppButton style={styles.saveBtn} onPress={handleSave}>
        Save
      </AppButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  spacingXs: {
    marginBottom: appTheme.spacing.xs,
  },
  cityRow: {
    flexDirection: 'row',
    columnGap: appTheme.spacing.sm,
    marginBottom: appTheme.spacing.sm,
  },
  cityChip: {
    minWidth: 140,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: appTheme.spacing.sm,
  },
  bold: {
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: appTheme.spacing.lg,
  },
});

export default EditAddressScreen;
