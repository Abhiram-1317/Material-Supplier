import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput as PaperTextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import {appTheme} from '../../theme/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {useAuth} from '../../context/AuthContext';

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {requestOtp} = useAuth();

  const isValid = useMemo(() => /^\d{10}$/.test(phone), [phone]);
  const errorText = touched && !isValid ? 'Enter a valid 10-digit number' : undefined;

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;
    setError(null);
    setSubmitting(true);
    const fullPhone = `+91${phone}`;
    try {
      await requestOtp(fullPhone);
      navigation.navigate('OTP', {phoneNumber: fullPhone});
    } catch (e) {
      setError('Unable to send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerBlock}>
        <AppText variant="title2" style={styles.heading}>
          Login to continue
        </AppText>
        <AppText variant="body" color={appTheme.colors.textSecondary}>
          Enter your mobile number to get an OTP.
        </AppText>
      </View>

      <View style={styles.form}>
        <AppTextInput
          label="Phone number"
          value={phone}
          onChangeText={value => setPhone(value.replace(/[^\d]/g, ''))}
          keyboardType="phone-pad"
          maxLength={10}
          left={<PaperTextInput.Affix text="+91" />}
          errorText={errorText}
        />
        <AppButton
          onPress={handleSubmit}
          disabled={!isValid || submitting}
          style={styles.submit}
          loading={submitting}
        >
          Send OTP
        </AppButton>
        {error ? (
          <AppText variant="caption" color={appTheme.colors.error} style={{marginTop: appTheme.spacing.sm}}>
            {error}
          </AppText>
        ) : null}
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" color={appTheme.colors.textSecondary}>
          By continuing, you agree to our Terms & Privacy Policy.
        </AppText>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerBlock: {
    marginTop: appTheme.spacing.xl,
    marginBottom: appTheme.spacing.lg,
  },
  heading: {
    marginBottom: appTheme.spacing.xs,
  },
  form: {
    marginTop: appTheme.spacing.lg,
  },
  submit: {
    marginTop: appTheme.spacing.lg,
  },
  footer: {
    marginTop: appTheme.spacing.xl,
  },
});

export default LoginScreen;
