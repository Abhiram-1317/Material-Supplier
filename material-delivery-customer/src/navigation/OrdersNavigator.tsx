import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrdersListScreen} from '../screens/orders/OrdersListScreen';
import {OrderDetailsScreen} from '../screens/orders/OrderDetailsScreen';
import {OrderSummaryScreen} from '../screens/orders/OrderSummaryScreen';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: {orderId: string};
  OrderSummary: {orderId: string};
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
    </Stack.Navigator>
  );
}
