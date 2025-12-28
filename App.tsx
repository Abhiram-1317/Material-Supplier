import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {PaperProvider} from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import {appTheme} from './src/theme/theme';
import {AuthProvider} from './src/context/AuthContext';
import {UserProfileProvider} from './src/context/UserProfileContext';
import {CartProvider} from './src/context/CartContext';
import {LocationProvider} from './src/context/LocationContext';

export default function App() {
  return (
    <PaperProvider theme={appTheme.paper}>
      <AuthProvider>
        <UserProfileProvider>
          <CartProvider>
            <LocationProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" backgroundColor={appTheme.colors.background} />
                <RootNavigator />
              </NavigationContainer>
            </LocationProvider>
          </CartProvider>
        </UserProfileProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
