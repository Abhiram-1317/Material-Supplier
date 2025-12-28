import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AppTabsNavigator from './AppTabsNavigator';
import {useAuth} from '../context/AuthContext';
import {ActivityIndicator, View} from 'react-native';
import AppText from '../components/ui/AppText';
import {appTheme} from '../theme/theme';

export type RootStackParamList = {
  AuthStack: undefined;
  AppTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color={appTheme.colors.primary} />
        <AppText variant="body" style={{marginTop: appTheme.spacing.md}}>
          Loading...
        </AppText>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="AppTabs" component={AppTabsNavigator} />
      ) : (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
