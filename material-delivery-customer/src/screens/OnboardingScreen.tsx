import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export function OnboardingScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{flex: 1, padding: 24, justifyContent: 'center'}}>
        <Text style={{fontSize: 28, fontWeight: '700', marginBottom: 12}}>
          Welcome to Material Delivery
        </Text>
        <Text style={{fontSize: 16, color: '#4B5563', marginBottom: 32}}>
          Track orders, schedule deliveries, and manage your account.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Login' as never)}>
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}
