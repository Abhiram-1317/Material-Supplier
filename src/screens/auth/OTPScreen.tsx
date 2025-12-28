import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import {appTheme} from '../../theme/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {useAuth} from '../../context/AuthContext';

export type OTPScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const RESEND_SECONDS = 30;

const OTPScreen: React.FC<OTPScreenProps> = ({navigation, route}) => {
  const {phoneNumber} = route.params;
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {verifyOtp, requestOtp} = useAuth();

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => setSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const formattedPhone = useMemo(() => {
    if (!phoneNumber) return '';
    return `+91-${phoneNumber}`;
  }, [phoneNumber]);

  const isValidOtp = otp.length === 6;

  const handleVerify = async () => {
    if (!isValidOtp || !phoneNumber) return;
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(phoneNumber, otp);
      navigation.getParent()?.reset({
        index: 0,
        routes: [{name: 'AppTabs' as never}],
      });
    } catch (e) {
      setError('Invalid OTP, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSeconds(RESEND_SECONDS);
    setOtp('');
    setError(null);
    try {
      await requestOtp(phoneNumber);
    } catch (e) {
      setError('Unable to resend OTP. Please try again.');
    }
  };

  return (
    <ScreenContainer scrollable>
      <AppText variant="title2" style={styles.heading}>
        Verify OTP
      </AppText>
      <AppText variant="body" color={appTheme.colors.textSecondary}>
        We have sent an OTP to {formattedPhone || '+91-XXXXXXX'}.
      </AppText>

      <View style={styles.form}>
        <AppTextInput
          label="Enter 6-digit code"
          value={otp}
          onChangeText={value => setOtp(value.replace(/[^\d]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
          contentStyle={styles.otpContent}
        />
        <AppButton
          onPress={handleVerify}
          disabled={!isValidOtp || submitting}
          style={styles.verifyButton}
          loading={submitting}
        >
          Verify & Continue
        </AppButton>
        {error ? (
          <AppText variant="caption" color={appTheme.colors.error} style={{marginTop: appTheme.spacing.sm}}>
            {error}
          </AppText>
        ) : null}
      </View>

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <AppText variant="body" color={appTheme.colors.textSecondary}>
            Didn't receive the OTP? Resend in {seconds}s
          </AppText>
        ) : (
          <AppText
            variant="body"
            color={appTheme.colors.primary}
            onPress={handleResend}
          >
            Resend OTP
          </AppText>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginTop: appTheme.spacing.xl,
    marginBottom: appTheme.spacing.sm,
  },
  form: {
    marginTop: appTheme.spacing.xl,
  },
  otpInput: {
    textAlign: 'center',
  },
  otpContent: {
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: appTheme.spacing.lg,
  },
  resendRow: {
    marginTop: appTheme.spacing.lg,
    alignItems: 'center',
  },
});

export default OTPScreen;
