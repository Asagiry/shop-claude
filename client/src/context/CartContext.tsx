import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  exportCart: () => string;
  importCart: (data: string) => boolean;
}

const CartContext = createContext<CartContextType>(null!);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id && i.size === item.size);
      if (existing) {
        return prev.map(i =>
          i.product_id === item.product_id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: number, size: string) => {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.size === size)));
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product_id === productId && i.size === size ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const exportCart = () => {
    return btoa(JSON.stringify(items));
  };

  const importCart = (data: string): boolean => {
    try {
      const parsed = JSON.parse(atob(data));
      if (Array.isArray(parsed)) {
        setItems(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, exportCart, importCart }}>
      {children}
    </CartContext.Provider>
  );
};
