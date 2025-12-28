import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export function OrdersScreen() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{flex: 1, padding: 24}}>
        <Text style={{fontSize: 24, fontWeight: '700', marginBottom: 12}}>Orders</Text>
        <Text style={{fontSize: 16, color: '#4B5563'}}>Orders list placeholder.</Text>
      </View>
    </SafeAreaView>
  );
}
