"use client";

import {useCallback, useMemo, useState} from 'react';
import type {City} from '@/data/products';
import {INITIAL_ORDERS, OrderStatus, SupplierOrder} from '@/data/orders';

export type OrderFilters = {
  city?: City | 'ALL';
  status?: OrderStatus | 'ALL';
  search?: string; // matches order id, siteLabel, customerName
};

export function useSupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>(INITIAL_ORDERS);
  const [filters, setFilters] = useState<OrderFilters>({
    city: 'ALL',
    status: 'ALL',
    search: '',
  });

  const updateFilters = useCallback((partial: Partial<OrderFilters>) => {
    setFilters((prev) => ({...prev, ...partial}));
  }, []);

  const filteredOrders = useMemo(() => {
    const searchValue = (filters.search ?? '').trim().toLowerCase();
    return orders.filter((order) => {
      if (filters.city && filters.city !== 'ALL' && order.city !== filters.city) return false;
      if (filters.status && filters.status !== 'ALL' && order.status !== filters.status) return false;
      if (searchValue) {
        const haystack = `${order.id} ${order.siteLabel} ${order.customerName}`.toLowerCase();
        if (!haystack.includes(searchValue)) return false;
      }
      return true;
    });
  }, [filters.city, filters.search, filters.status, orders]);

  const setOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? {...order, status} : order)));
  }, []);

  const advanceOrderStatus = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId) return order;
          const next = getNextStatus(order.status);
          return next === order.status ? order : {...order, status: next};
        }),
      );
    },
    [],
  );

  return {
    orders,
    filteredOrders,
    filters,
    updateFilters,
    setOrderStatus,
    advanceOrderStatus,
  };
}

function getNextStatus(status: OrderStatus): OrderStatus {
  switch (status) {
    case 'PLACED':
      return 'ACCEPTED';
    case 'ACCEPTED':
      return 'DISPATCHED';
    case 'DISPATCHED':
      return 'DELIVERED';
    case 'DELIVERED':
    case 'CANCELLED':
    default:
      return status;
  }
}
