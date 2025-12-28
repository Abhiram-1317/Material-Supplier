import React, {createContext, useContext, useMemo, useState} from 'react';
import {MaterialProduct, Supplier} from '../data/mockMaterials';
import {createOrder, type ApiOrder} from '../api/orders';

export type CartItem = {
  id: string; // productId
  product: MaterialProduct;
  supplier: Supplier;
  quantity: number;
};

export type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  addItem: (product: MaterialProduct, supplier: Supplier, quantity: number) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (params: {
    siteId: string;
    deliverySlot: string;
  }) => Promise<ApiOrder | null>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.pricePerUnit * item.quantity, 0),
    [items],
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const addItem = (product: MaterialProduct, supplier: Supplier, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? {...i, quantity: i.quantity + quantity} : i,
        );
      }
      return [...prev, {id: product.id, product, supplier, quantity}];
    });
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setItems(prev => {
      if (quantity <= 0) {
        return prev.filter(i => i.id !== productId);
      }
      return prev.map(i => (i.id === productId ? {...i, quantity} : i));
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  const clearCart = () => setItems([]);

  const placeOrder: CartContextValue['placeOrder'] = async ({siteId, deliverySlot}) => {
    if (!items.length) return null;

    const supplierId = items[0]?.product.supplierId || items[0]?.supplier.id;
    if (!supplierId) return null;

    const payload = {
      siteId,
      supplierId,
      scheduledSlot: deliverySlot,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    const order = await createOrder(payload);
    clearCart();
    return order;
  };

  const value = useMemo(
    () => ({
      items,
      subtotal,
      totalQuantity,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      placeOrder,
    }),
    [items, subtotal, totalQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
