export type OrderStatus = "pending" | "preparing" | "completed";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Flavor {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  hasFlavors?: boolean;
  maxFlavors?: number;
  available?: boolean;
}

export interface CartItemCustomization {
  flavors: string[];
  extras: string[];
  removedIngredients: string[];
  notes: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  customization: CartItemCustomization;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  customerNote?: string;
}
