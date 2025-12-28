import React, {useMemo, useState} from 'react';
import {View, Text, ScrollView, Pressable, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useUserProfile} from '../context/UserProfileContext';
import {requestAndDetectCity} from '../services/locationService';
import {useLocation} from '../context/LocationContext';
import {ProfileStackParamList} from '../navigation/ProfileNavigator';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const {addresses, refreshAddresses, loadingAddresses, addOrUpdateAddress} = useUserProfile();
  const {SERVICE_CITIES} = useLocation();
  const [creatingFromLocation, setCreatingFromLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const defaultAddressId = useMemo(() => addresses.find(a => a.isDefault)?.id, [addresses]);

  const handleUseMyLocation = async () => {
    try {
      setCreatingFromLocation(true);
      setLocationError(null);

      const res = await requestAndDetectCity();
      if (!res.city) {
        setLocationError(res.error || 'Could not detect a supported city.');
        return;
      }

      const detectedCity = SERVICE_CITIES.includes(res.city) ? res.city : null;
      if (!detectedCity) {
        setLocationError('Could not map detected city to backend city.');
        return;
      }

      const label = 'Current location';
      const addressLine = res.addressLine ?? `${detectedCity} current location`;
      const pincode = res.pincode ?? '000000';

      await addOrUpdateAddress({
        label,
        city: detectedCity,
        line1: addressLine,
        pincode,
        isDefault: true,
        latitude: res.latitude,
        longitude: res.longitude,
      });

      await refreshAddresses();
    } catch (err) {
      setLocationError('Failed to save location as site.');
    } finally {
      setCreatingFromLocation(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <ScrollView contentContainerStyle={{padding: 24, paddingBottom: 32}}>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flex: 1, marginRight: 12}}>
            <Text style={{fontSize: 16, fontWeight: '700'}}>Notifications</Text>
            <Text style={{color: '#4B5563', marginTop: 4}}>
              View your order updates and alerts
            </Text>
          </View>
          <Text style={{color: '#1A73E8', fontWeight: '600'}}>Open</Text>
        </Pressable>
        
          <Pressable
            onPress={() => navigation.navigate('Faq')}
            style={{
              marginBottom: 16,
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{flex: 1, marginRight: 12}}>
              <Text style={{fontSize: 16, fontWeight: '700'}}>FAQs</Text>
              <Text style={{color: '#4B5563', marginTop: 4}}>
                Quick answers about payments, delivery, and returns
              </Text>
            </View>
            <Text style={{color: '#1A73E8', fontWeight: '600'}}>Open</Text>
          </Pressable>

        <View style={{marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View>
            <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 4}}>Addresses</Text>
            <Text style={{fontSize: 14, color: '#4B5563'}}>Manage your delivery sites</Text>
          </View>
          <Pressable
            onPress={handleUseMyLocation}
            disabled={creatingFromLocation}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#1A73E8',
              backgroundColor: creatingFromLocation ? '#E5E7EB' : '#FFFFFF',
            }}>
            <Text style={{color: '#1A73E8', fontWeight: '600'}}>
              {creatingFromLocation ? 'Detecting...' : 'Use my location'}
            </Text>
          </Pressable>
        </View>

        {locationError ? (
          <Text style={{color: '#DC2626', marginBottom: 8}}>{locationError}</Text>
        ) : null}

        {loadingAddresses ? (
          <View style={{paddingVertical: 16, alignItems: 'center'}}>
            <ActivityIndicator />
          </View>
        ) : (
          addresses.map(address => (
            <View
              key={address.id}
              style={{
                marginBottom: 12,
                padding: 16,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}>
              <Text style={{fontSize: 16, fontWeight: '700'}}>{address.label}</Text>
              <Text style={{color: '#4B5563', marginTop: 4}}>
                {address.line1}, {address.city} - {address.pincode}
              </Text>
              {address.latitude != null && address.longitude != null ? (
                <Text style={{color: '#6B7280', marginTop: 2}}>
                  Lat: {address.latitude.toFixed(4)}, Lng: {address.longitude.toFixed(4)}
                </Text>
              ) : null}
              {address.id === defaultAddressId ? (
                <Text style={{color: '#10B981', fontWeight: '600', marginTop: 6}}>Default</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
