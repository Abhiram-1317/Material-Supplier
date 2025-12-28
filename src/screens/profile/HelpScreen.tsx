import React from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {List} from 'react-native-paper';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import {appTheme} from '../../theme/theme';

const HelpScreen: React.FC = () => {
  const supportPhone = '6302977234';
  const supportEmail = 'support@yourdomain.com';

  const handleCall = () => Linking.openURL(`tel:${supportPhone}`).catch(() => {
    Alert.alert('Unable to place call', `Call ${supportPhone}`);
  });

  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/91${supportPhone}`).catch(() => {
      Alert.alert('Unable to open WhatsApp', `Message us at +91${supportPhone}`);
    });

  const handleEmail = () => Linking.openURL(`mailto:${supportEmail}`).catch(() => {
    Alert.alert('Email support', supportEmail);
  });

  const contactRows = [
    {title: 'Call support', value: `+91 ${supportPhone}`, onPress: handleCall},
    {title: 'WhatsApp us', value: `+91 ${supportPhone}`, onPress: handleWhatsApp},
    {title: 'Email support', value: supportEmail, onPress: handleEmail},
  ];

  return (
    <ScreenContainer scrollable headerTitle="Help & support">
      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Quick contact</AppText>
        {contactRows.map(row => (
          <List.Item
            key={row.title}
            title={row.title}
            description={row.value}
            onPress={row.onPress}
            left={props => <List.Icon {...props} icon="phone" />}
          />
        ))}
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>FAQs</AppText>
        <List.Accordion title="Which areas do you serve?" description="Serviceable regions">
          <AppText variant="body" style={styles.faqText}>Currently we serve only Warangal and Hanumakonda.</AppText>
        </List.Accordion>
        <List.Accordion title="What materials can I order?" description="Materials range">
          <AppText variant="body" style={styles.faqText}>Sand, cement, ready-mix concrete, bricks, precast walls, and more.</AppText>
        </List.Accordion>
        <List.Accordion title="What are the delivery timings?" description="Slots">
          <AppText variant="body" style={styles.faqText}>Typically between 8 AM and 6 PM, depending on slot availability.</AppText>
        </List.Accordion>
        <List.Accordion title="How do I pay?" description="Payment methods">
          <AppText variant="body" style={styles.faqText}>Cash on delivery to the supplier. Online payments coming soon.</AppText>
        </List.Accordion>
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" style={styles.spacingSm}>Legal</AppText>
        <List.Item title="Terms & Conditions" onPress={() => Alert.alert('Coming soon', 'Terms & Conditions coming soon.')} right={props => <List.Icon {...props} icon="chevron-right" />} />
        <List.Item title="Privacy Policy" onPress={() => Alert.alert('Coming soon', 'Privacy Policy coming soon.')} right={props => <List.Icon {...props} icon="chevron-right" />} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    padding: appTheme.spacing.md,
    marginBottom: appTheme.spacing.md,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  faqText: {
    paddingHorizontal: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.sm,
  },
});

export default HelpScreen;
