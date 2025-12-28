import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button, TextInput} from 'react-native-paper';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/RootNavigator';

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogin = () => {
    navigation.navigate('AppTabs');
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F3F4F6'}}>
      <View style={{flex: 1, padding: 24, justifyContent: 'center', gap: 16}}>
        <Text style={{fontSize: 24, fontWeight: '700'}}>Sign in</Text>
        <Text style={{fontSize: 14, color: '#4B5563'}}>Use your account to continue.</Text>
        <TextInput label="Email" mode="outlined" autoCapitalize="none" keyboardType="email-address" />
        <TextInput label="Password" mode="outlined" secureTextEntry />
        <Button mode="contained" onPress={handleLogin}>
          Continue
        </Button>
        <Button mode="text" onPress={() => navigation.goBack()}>
          Back
        </Button>
      </View>
    </SafeAreaView>
  );
}
