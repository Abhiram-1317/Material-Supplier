import React, {createContext, useContext, useMemo, useState} from 'react';
import {type ApiProduct} from '../api/catalog';
import {createOrder, type ApiOrder, type CreateOrderPayload} from '../api/orders';

export type CartItem = {
  product: ApiProduct;
  quantity: number;
};

export type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (product: ApiProduct, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (params: {siteId: string; deliverySlot: string}) => Promise<ApiOrder | null>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: ApiProduct, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? {...i, quantity: i.quantity + quantity} : i,
        );
      }
      return [...prev, {product, quantity}];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(prev => prev.map(i => (i.product.id === productId ? {...i, quantity} : i)));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const placeOrder = async ({siteId, deliverySlot}: {siteId: string; deliverySlot: string}) => {
    if (items.length === 0) return null;

    const firstSupplierId = items[0].product.supplier.id;
    const payload: CreateOrderPayload = {
      siteId,
      supplierId: firstSupplierId,
      scheduledSlot: deliverySlot,
      items: items.map(item => ({productId: item.product.id, quantity: item.quantity})),
    };

    const order = await createOrder(payload);
    clearCart();
    return order;
  };

  const totalQuantity = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({items, totalQuantity, addItem, updateQuantity, removeItem, clearCart, placeOrder}),
    [items, totalQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
