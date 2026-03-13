import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { CartItem, Order, OrderStatus, Product, Category, Flavor, Extra } from "@/types/pos";
import { CATEGORIES, PRODUCTS, FLAVORS, EXTRAS } from "@/data/products";
import { supabase } from "@/lib/supabase";

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
  placeOrder: (note?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  orderCounter: number;
  loading: boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [flavors, setFlavors] = useState<Flavor[]>(FLAVORS);
  const [extras, setExtras] = useState<Extra[]>(EXTRAS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCounter, setOrderCounter] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Initial Fetch and Real-time Subscription
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      
      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData.map(o => ({
          ...o,
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt),
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        })));
        
        // Calculate next order counter
        if (ordersData.length > 0) {
          const maxCounter = Math.max(...ordersData.map(o => o.orderNumber));
          setOrderCounter(maxCounter + 1);
        }
      }

      setLoading(false);
    };

    fetchInitialData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => [{
              ...newOrder,
              createdAt: new Date(newOrder.createdAt),
              updatedAt: new Date(newOrder.updatedAt),
              items: typeof newOrder.items === 'string' ? JSON.parse(newOrder.items as any) : newOrder.items
            }, ...prev]);
            setOrderCounter(c => Math.max(c, (newOrder.orderNumber || 0) + 1));
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? {
                ...updatedOrder,
                createdAt: new Date(updatedOrder.createdAt),
                updatedAt: new Date(updatedOrder.updatedAt),
                items: typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items as any) : updatedOrder.items
              } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // No longer using localStorage for persistence


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
    async (note?: string): Promise<Order | null> => {
      const orderData = {
        id: crypto.randomUUID(),
        orderNumber: orderCounter,
        items: JSON.stringify(cart),
        status: "pending",
        total: cartTotal,
        customerNote: note,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error("Error placing order:", error);
        return null;
      }

      setCart([]);
      // Order list is updated via real-time subscription
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        items: cart, // use current cart for immediate return
      };
    },
    [cart, cartTotal, orderCounter]
  );

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
    }
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
        loading,
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
