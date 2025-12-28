import React from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AddressCard from '../../components/profile/AddressCard';
import {useUserProfile} from '../../context/UserProfileContext';
import {ProfileStackParamList} from '../../navigation/AppTabsNavigator';
import {appTheme} from '../../theme/theme';

const AddressListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const {addresses, deleteAddress, setDefaultAddress} = useUserProfile();

  const handleDelete = (id: string) => {
    Alert.alert('Delete address', 'Are you sure you want to delete this address?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
          } catch (err) {
            Alert.alert('Error', 'Unable to delete address');
          }
        },
      },
    ]);
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <AppText variant="title2" style={styles.spacingSm}>No saved addresses yet</AppText>
      <AppText variant="body" color={appTheme.colors.textSecondary} style={styles.spacingSm}>
        Add your Warangal or Hanumakonda sites to quickly place orders.
      </AppText>
      <AppButton onPress={() => navigation.navigate('EditAddress')}>Add new address</AppButton>
    </View>
  );

  return (
    <ScreenContainer headerTitle="Saved addresses">
      <FlatList
        data={addresses}
        keyExtractor={item => item.id}
        contentContainerStyle={addresses.length ? styles.listContent : styles.listEmpty}
        renderItem={({item}) => (
          <AddressCard
            address={item}
            onEdit={() => navigation.navigate('EditAddress', {addressId: item.id})}
            onDelete={() => handleDelete(item.id)}
            onSetDefault={
              item.isDefault
                ? undefined
                : async () => {
                    try {
                      await setDefaultAddress(item.id);
                    } catch {
                      Alert.alert('Error', 'Unable to set default');
                    }
                  }
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{height: appTheme.spacing.md}} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {addresses.length ? (
        <AppButton style={styles.addBtn} onPress={() => navigation.navigate('EditAddress')}>
          Add new address
        </AppButton>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: appTheme.spacing.xl,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: appTheme.spacing.xl,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.xl,
    rowGap: appTheme.spacing.sm,
  },
  spacingSm: {
    marginBottom: appTheme.spacing.sm,
  },
  addBtn: {
    marginTop: appTheme.spacing.lg,
  },
});

export default AddressListScreen;
