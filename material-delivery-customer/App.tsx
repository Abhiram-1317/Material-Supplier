import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {StatusBar} from 'expo-status-bar';

import {appTheme} from './src/theme/theme';
import {RootNavigator} from './src/navigation/RootNavigator';
import {LocationProvider} from './src/context/LocationContext';
import {AuthProvider} from './src/context/AuthContext';
import {UserProfileProvider} from './src/context/UserProfileContext';
import {CartProvider} from './src/context/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <UserProfileProvider>
          <CartProvider>
            <PaperProvider theme={appTheme}>
              <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </PaperProvider>
          </CartProvider>
        </UserProfileProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
