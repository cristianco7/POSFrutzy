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
  placeOrder: (location: string, note?: string) => Promise<Order | null>;
  toggleFlavorAvailability: (id: string, available: boolean) => Promise<void>;
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

      // Fetch Flavors
      const { data: flavorsData, error: flavorsError } = await supabase
        .from('flavors')
        .select('*')
        .order('name');
      
      if (!flavorsError && flavorsData && flavorsData.length > 0) {
        setFlavors(flavorsData);
      } else if (flavorsError && (flavorsError as any).code !== 'PGRST116') {
        console.error("Error fetching flavors:", flavorsError);
      }

      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData.map(o => ({
          ...o,
          orderNumber: o.order_number,
          customerNote: o.customer_note,
          location: o.location || "Para llevar",
          createdAt: new Date(o.created_at),
          updatedAt: new Date(o.updated_at),
          items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items


        })));

        // Calculate next order counter
        if (ordersData.length > 0) {
          const maxCounter = Math.max(...ordersData.map(o => o.order_number || 0));
          setOrderCounter(maxCounter + 1);
        }
      }


      setLoading(false);
    };

    fetchInitialData();

    // Subscribe to real-time changes
    const ordersSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            setOrders((prev) => {
              // Check if order already exists (from optimistic update)
              if (prev.find(o => o.id === newOrder.id)) return prev;

              return [{
                ...newOrder,
                orderNumber: (newOrder as any).order_number,
                customerNote: (newOrder as any).customer_note,
                location: (newOrder as any).location || "Para llevar",
                createdAt: new Date((newOrder as any).created_at),
                updatedAt: new Date((newOrder as any).updated_at),
                items: typeof newOrder.items === 'string' ? JSON.parse(newOrder.items as any) : newOrder.items
              }, ...prev];

            });
            setOrderCounter(c => Math.max(c, ((newOrder as any).order_number || 0) + 1));
          } else if (payload.eventType === 'UPDATE') {

            const updatedOrder = payload.new as Order;
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? {
                ...updatedOrder,
                orderNumber: (updatedOrder as any).order_number,
                customerNote: (updatedOrder as any).customer_note,
                location: (updatedOrder as any).location || "Para llevar",
                createdAt: new Date((updatedOrder as any).created_at),
                updatedAt: new Date((updatedOrder as any).updated_at),
                items: typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items as any) : updatedOrder.items

              } : o))
            );

          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Real-time flavors
    const flavorsSubscription = supabase
      .channel('flavors_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flavors' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const updatedFlavor = payload.new as Flavor;
          setFlavors((prev) => prev.map(f => f.id === updatedFlavor.id ? updatedFlavor : f));
        } else if (payload.eventType === 'INSERT') {
          setFlavors((prev) => [...prev, payload.new as Flavor].sort((a, b) => a.name.localeCompare(b.name)));
        } else if (payload.eventType === 'DELETE') {
          setFlavors((prev) => prev.filter(f => f.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(flavorsSubscription);
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
    async (location: string, note?: string): Promise<Order | null> => {
      const orderId = crypto.randomUUID();
      const orderData = {
        id: orderId,
        orderNumber: orderCounter,
        items: [...cart],
        status: "pending" as OrderStatus,
        total: cartTotal,
        location,
        customerNote: note,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistic Update
      setOrders(prev => [orderData, ...prev]);
      setOrderCounter(n => n + 1);
      setCart([]);

      const dbOrder = {
        id: orderId,
        order_number: orderCounter,
        items: JSON.stringify(cart),
        status: "pending",
        total: cartTotal,
        location: location,
        customer_note: note,
        created_at: orderData.createdAt.toISOString(),
        updated_at: orderData.updatedAt.toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([dbOrder])
        .select()
        .single();

      if (error) {
        console.error("Error placing order:", error);
        // Rollback on error
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return null;
      }

      return orderData;
    },
    [cart, cartTotal, orderCounter]
  );

  const toggleFlavorAvailability = useCallback(async (id: string, available: boolean) => {
    // Optimistic Update
    setFlavors(prev => prev.map(f => f.id === id ? { ...f, available } : f));

    const { error } = await supabase
      .from('flavors')
      .update({ available })
      .eq('id', id);

    if (error) {
      console.error("Error updating flavor availability:", error);
      // Revert on error
      const { data } = await supabase.from('flavors').select('*').eq('id', id).single();
      if (data) {
        setFlavors(prev => prev.map(f => f.id === id ? data : f));
      }
    }
  }, []);


  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date() } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
      // Success is assumed; in a full impl we'd rollback here, but real-time sync will fix it anyway
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
        toggleFlavorAvailability,
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
