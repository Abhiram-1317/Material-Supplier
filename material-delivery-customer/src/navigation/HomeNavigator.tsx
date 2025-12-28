import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {CategoryListScreen} from '../screens/CategoryListScreen';
import {ProductListScreen} from '../screens/ProductListScreen';
import {ProductDetailsScreen} from '../screens/ProductDetailsScreen';
import {CheckoutScreen} from '../screens/cart/CheckoutScreen';
import {OrderSummaryScreen} from '../screens/orders/OrderSummaryScreen';

export type HomeStackParamList = {
  Home: undefined;
  CategoryList: undefined;
  ProductList: {
    categorySlug?: string;
    categoryName?: string;
  };
  ProductDetails: {
    productId: string;
  };
  Checkout: undefined;
  OrderSummary: {orderId: string};
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
    </Stack.Navigator>
  );
}
