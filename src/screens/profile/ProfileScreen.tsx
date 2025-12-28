import React, {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, View} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import {useAuth} from '../../context/AuthContext';
import {useUserProfile} from '../../context/UserProfileContext';
import {useLocation} from '../../context/LocationContext';
import {ProfileStackParamList} from '../../navigation/AppTabsNavigator';
import {appTheme} from '../../theme/theme';
import {fetchOrders} from '../../api/orders';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const {user, logout} = useAuth();
  const {profile, addresses} = useUserProfile();
  const {currentCity} = useLocation();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const orders = await fetchOrders();
        setOrdersCount(orders.length);
      } catch {
        setOrdersCount(0);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const name = profile.fullName || 'Contractor';

  return (
    <ScreenContainer headerTitle="Profile" scrollable>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="title2" style={styles.bold}>{name}</AppText>
            <AppText variant="body" color={appTheme.colors.textSecondary}>
              {user?.phone || 'Add phone number'}
            </AppText>
            {profile.companyName ? (
              <AppText variant="caption" color={appTheme.colors.textSecondary}>
                {profile.companyName}
              </AppText>
            ) : null}
            <AppText variant="caption" style={styles.spacingSm} color={appTheme.colors.textSecondary}>
              Serving sites in {currentCity}
            </AppText>
          </View>
          <Pressable onPress={() => navigation.navigate('Settings')}>
            <AppText variant="body" color={appTheme.colors.primary}>Edit profile</AppText>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText variant="subtitle" style={styles.bold}>{ordersCount}</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.statLabel}>Orders</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="subtitle" style={styles.bold}>{addresses.length}</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.statLabel}>Saved sites</AppText>
          </View>
          <View style={styles.statItem}>
            <AppText variant="subtitle" style={styles.bold}>2</AppText>
            <AppText variant="caption" color={appTheme.colors.textSecondary} style={styles.statLabel}>Cities</AppText>
          </View>
        </View>
      </View>

      <View style={styles.listCard}>
        <NavRow
          title="Saved addresses"
          subtitle="Manage Warangal and Hanumakonda sites"
          icon="map-marker"
          onPress={() => navigation.navigate('AddressList')}
        />
        <NavRow
          title="Settings"
          subtitle="Profile and preferences"
          icon="cog-outline"
          onPress={() => navigation.navigate('Settings')}
        />
        <NavRow
          title="Help & support"
          subtitle="Contact support and FAQs"
          icon="help-circle-outline"
          onPress={() => navigation.navigate('Help')}
          showDivider={false}
        />
      </View>

      <AppButton variant="secondary" onPress={handleLogout} style={styles.logoutBtn}>
        Logout
      </AppButton>
    </ScreenContainer>
  );
};

type NavRowProps = {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showDivider?: boolean;
};

const NavRow: React.FC<NavRowProps> = ({title, subtitle, icon, onPress, showDivider = true}) => (
  <Pressable onPress={onPress} style={styles.navRow}>
    <View style={styles.navLeft}>
      <View style={styles.navIcon}>
        <MaterialCommunityIcons name={icon as any} size={20} color={appTheme.colors.primary} />
      </View>
      <View>
        <AppText variant="body" style={styles.bold}>{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color={appTheme.colors.textSecondary}>{subtitle}</AppText>
        ) : null}
      </View>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color={appTheme.colors.textSecondary} />
    {showDivider ? <View style={styles.rowDivider} /> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    padding: appTheme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    marginBottom: appTheme.spacing.lg,
    rowGap: appTheme.spacing.sm,
  },
  listCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: appTheme.spacing.sm,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    marginTop: appTheme.spacing.xs / 2,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.md,
    backgroundColor: appTheme.colors.surface,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    columnGap: appTheme.spacing.md,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appTheme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    position: 'absolute',
    left: appTheme.spacing.md,
    right: appTheme.spacing.md,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: appTheme.colors.border,
  },
  bold: {
    fontWeight: '700',
  },
  spacingSm: {
    marginTop: appTheme.spacing.sm,
  },
  logoutBtn: {
    marginTop: appTheme.spacing.lg,
  },
});

export default ProfileScreen;
