import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import CategoryListScreen from '../screens/home/CategoryListScreen';
import ProductListScreen from '../screens/home/ProductListScreen';
import ProductDetailsScreen from '../screens/home/ProductDetailsScreen';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import OrderSummaryScreen from '../screens/cart/OrderSummaryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressListScreen from '../screens/profile/AddressListScreen';
import EditAddressScreen from '../screens/profile/EditAddressScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import {appTheme} from '../theme/theme';

export type HomeStackParamList = {
  Home: undefined;
  CategoryList: undefined;
  ProductList: {
    categoryId?: string;
    categoryName?: string;
    supplierId?: string;
    showPopular?: boolean;
  } | undefined;
  ProductDetails: {
    productId: string;
  };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: {orderId: string};
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderSummary: {orderId: string; orderCode?: string};
};

export type ProfileStackParamList = {
  Profile: undefined;
  AddressList: undefined;
  EditAddress: {addressId?: string} | undefined;
  Settings: undefined;
  Help: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{headerShown: false}}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="CategoryList" component={CategoryListScreen} />
    <HomeStack.Screen name="ProductList" component={ProductListScreen} />
    <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </HomeStack.Navigator>
);

const OrdersStackNavigator = () => (
  <OrdersStack.Navigator screenOptions={{headerShown: false}}>
    <OrdersStack.Screen name="OrdersList" component={OrdersListScreen} />
    <OrdersStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </OrdersStack.Navigator>
);

const CartStackNavigator = () => (
  <CartStack.Navigator screenOptions={{headerShown: false}}>
    <CartStack.Screen name="Cart" component={CartScreen} />
    <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    <CartStack.Screen name="OrderSummary" component={OrderSummaryScreen} />
  </CartStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{headerShown: false}}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="AddressList" component={AddressListScreen} />
    <ProfileStack.Screen name="EditAddress" component={EditAddressScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Help" component={HelpScreen} />
  </ProfileStack.Navigator>
);

const AppTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.primary,
        tabBarInactiveTintColor: appTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: appTheme.colors.surface,
          borderTopColor: appTheme.colors.border,
        },
        tabBarIcon: ({color, size}) => {
          const iconName = (() => {
            switch (route.name) {
              case 'HomeTab':
                return 'home-city';
              case 'OrdersTab':
                return 'clipboard-list';
              case 'CartTab':
                return 'cart';
              case 'ProfileTab':
                return 'account-circle';
              default:
                return 'circle-outline';
            }
          })();
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{title: 'Home'}}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{title: 'Orders'}}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{title: 'Cart'}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export default AppTabsNavigator;
