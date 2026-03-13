import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { CartItem, Order, OrderStatus, Product, Category, Flavor, Extra } from "@/types/pos";
import { CATEGORIES, PRODUCTS, FLAVORS, EXTRAS } from "@/data/products";

interface POSContextType {
  // Catalog (editable in admin)
  categories: Category[];
  products: Product[];
  flavors: Flavor[];
  extras: Extra[];
  setCategories: (c: Category[]) => void;
  setProducts: (p: Product[]) => void;
  setFlavors: (f: Flavor[]) => void;
  setExtras: (e: Extra[]) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Orders
  orders: Order[];
  placeOrder: (note?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  orderCounter: number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEY = "pos_data";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Rehydrate dates
    if (parsed.orders) {
      parsed.orders = parsed.orders.map((o: Order) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        updatedAt: new Date(o.updatedAt),
      }));
    }
    return parsed;
  } catch {
    return null;
  }
}

export function POSProvider({ children }: { children: React.ReactNode }) {
  const stored = loadFromStorage();

  const [categories, setCategories] = useState<Category[]>(stored?.categories ?? CATEGORIES);
  const [products, setProducts] = useState<Product[]>(stored?.products ?? PRODUCTS);
  const [flavors, setFlavors] = useState<Flavor[]>(stored?.flavors ?? FLAVORS);
  const [extras, setExtras] = useState<Extra[]>(stored?.extras ?? EXTRAS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(stored?.orders ?? []);
  const [orderCounter, setOrderCounter] = useState<number>(stored?.orderCounter ?? 1);

  // Persist catalog and orders to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ categories, products, flavors, extras, orders, orderCounter })
    );
  }, [categories, products, flavors, extras, orders, orderCounter]);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id
            ? { ...c, quantity: c.quantity + item.quantity, totalPrice: c.unitPrice * (c.quantity + item.quantity) }
            : c
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  }, []);

  const updateCartItemQuantity = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.id === cartItemId ? { ...c, quantity: qty, totalPrice: c.unitPrice * qty } : c
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = useCallback(
    (note?: string): Order => {
      const order: Order = {
        id: crypto.randomUUID(),
        orderNumber: orderCounter,
        items: [...cart],
        status: "pending",
        total: cartTotal,
        createdAt: new Date(),
        updatedAt: new Date(),
        customerNote: note,
      };
      setOrders((prev) => [order, ...prev]);
      setOrderCounter((n) => n + 1);
      setCart([]);
      return order;
    },
    [cart, cartTotal, orderCounter]
  );

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date() } : o))
    );
  }, []);

  return (
    <POSContext.Provider
      value={{
        categories,
        products,
        flavors,
        extras,
        setCategories,
        setProducts,
        setFlavors,
        setExtras,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        placeOrder,
        updateOrderStatus,
        orderCounter,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error("usePOS must be used within POSProvider");
  return ctx;
}
