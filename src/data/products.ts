import type { Category, Product, Flavor, Extra } from "@/types/pos";

export const CATEGORIES: Category[] = [
  { id: "especial-infantil", name: "Especial Infantil", emoji: "🧸", color: "hsl(320 80% 70%)" },
  { id: "waffles", name: "Waffles", emoji: "🧇", color: "hsl(38 95% 58%)" },
  { id: "malteadas", name: "Malteadas", emoji: "🥤", color: "hsl(280 65% 65%)" },
  { id: "granizados", name: "Granizados", emoji: "🧊", color: "hsl(195 80% 55%)" },
  { id: "bebidas", name: "Bebidas", emoji: "🍹", color: "hsl(145 60% 50%)" },
  { id: "conos", name: "Conos", emoji: "🍦", color: "hsl(350 72% 56%)" },
  { id: "canastas", name: "Canastas", emoji: "🧺", color: "hsl(25 90% 55%)" },
  { id: "helados-especiales", name: "Helados Especiales", emoji: "🍨", color: "hsl(350 60% 50%)" },
];

export const PRODUCTS: Product[] = [
  // Especial Infantil
  { id: "p1", categoryId: "especial-infantil", name: "Gusa Split", price: 8000, hasFlavors: true, maxFlavors: 3, available: true },
  { id: "p2", categoryId: "especial-infantil", name: "Peppa Pig", price: 5000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p3", categoryId: "especial-infantil", name: "Abejita", price: 7000, hasFlavors: true, maxFlavors: 2, available: true },
  { id: "p4", categoryId: "especial-infantil", name: "Payasito", price: 7000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p5", categoryId: "especial-infantil", name: "Canasta Osito", price: 7000, hasFlavors: true, maxFlavors: 2, available: true },
  { id: "p6", categoryId: "especial-infantil", name: "Pollito", price: 7000, hasFlavors: true, maxFlavors: 1, available: true },

  // Waffles
  { id: "p7", categoryId: "waffles", name: "Waffle con helado sencillo", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p8", categoryId: "waffles", name: "Waffle con helado doble", price: 13000, hasFlavors: true, maxFlavors: 2, available: true },

  // Malteadas
  { id: "p9", categoryId: "malteadas", name: "Malteada sencilla", price: 8000, hasFlavors: true, maxFlavors: 1, available: true },

  // Granizados
  { id: "p10", categoryId: "granizados", name: "Limón", price: 6000, hasFlavors: false, available: true },
  { id: "p11", categoryId: "granizados", name: "Maracuyá", price: 6000, hasFlavors: false, available: true },
  { id: "p12", categoryId: "granizados", name: "Cereza", price: 6000, hasFlavors: false, available: true },
  { id: "p13", categoryId: "granizados", name: "Fresa", price: 6000, hasFlavors: false, available: true },

  // Conos
  { id: "p14", categoryId: "conos", name: "Cono 1 sabor", price: 3000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p15", categoryId: "conos", name: "Cono 2 sabores", price: 6000, hasFlavors: true, maxFlavors: 2, available: true },
  { id: "p16", categoryId: "conos", name: "Cono 3 sabores", price: 8000, hasFlavors: true, maxFlavors: 3, available: true },

  // Canastas
  { id: "p17", categoryId: "canastas", name: "Canasta 3 sabores", price: 8000, hasFlavors: true, maxFlavors: 3, available: true },
  { id: "p18", categoryId: "canastas", name: "Canasta fruta + 1 helado", price: 9000, hasFlavors: true, maxFlavors: 1, available: true },

  // Helados Especiales
  { id: "p19", categoryId: "helados-especiales", name: "Ensalada de frutas pequeña", price: 11000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p20", categoryId: "helados-especiales", name: "Ensalada de frutas mediana", price: 13000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p21", categoryId: "helados-especiales", name: "Ensalada de frutas grande", price: 16000, hasFlavors: true, maxFlavors: 2, available: true },
  { id: "p22", categoryId: "helados-especiales", name: "Brownie con helado", price: 8000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p23", categoryId: "helados-especiales", name: "Choco Helado", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p24", categoryId: "helados-especiales", name: "Chocolocura", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p25", categoryId: "helados-especiales", name: "Copa Oreo", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p26", categoryId: "helados-especiales", name: "Copa Minichips", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p27", categoryId: "helados-especiales", name: "Banana Split", price: 12000, hasFlavors: true, maxFlavors: 2, available: true },
  { id: "p28", categoryId: "helados-especiales", name: "Banana Roy", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p29", categoryId: "helados-especiales", name: "Salpicón con helado", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p30", categoryId: "helados-especiales", name: "Fresas con crema", price: 8000, hasFlavors: false, available: true },
  { id: "p31", categoryId: "helados-especiales", name: "Copa Brownie", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p32", categoryId: "helados-especiales", name: "Copa Frutzy", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p33", categoryId: "helados-especiales", name: "Copa Chocorra", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p34", categoryId: "helados-especiales", name: "Cóctel de frutas", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p35", categoryId: "helados-especiales", name: "Oblea con fruta y helado", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p36", categoryId: "helados-especiales", name: "Copa de fresa", price: 12000, hasFlavors: false, available: true },
  { id: "p37", categoryId: "helados-especiales", name: "Copa Popeta", price: 10000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p38", categoryId: "helados-especiales", name: "Deliqueso", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p39", categoryId: "helados-especiales", name: "Parfait", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p40", categoryId: "helados-especiales", name: "Tentación", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
  { id: "p41", categoryId: "helados-especiales", name: "Maracumix", price: 12000, hasFlavors: true, maxFlavors: 1, available: true },
];

export const FLAVORS: Flavor[] = [
  { id: "vanilla", name: "Vainilla", color: "hsl(42 100% 72%)", available: true },
  { id: "chocolate", name: "Chocolate", color: "hsl(20 60% 40%)", available: true },
  { id: "strawberry", name: "Fresa", color: "hsl(350 75% 65%)", available: true },
  { id: "mango", name: "Mango", color: "hsl(38 95% 58%)", available: true },
  { id: "oreo", name: "Oreo", color: "hsl(0 0% 25%)", available: true },
];


export const EXTRAS: Extra[] = [
  { id: "queso", name: "Queso", price: 2000 },
  { id: "granola", name: "Granola", price: 2000 },
  { id: "helado-extra", name: "Helado extra", price: 2000 },
  { id: "chantilly", name: "Chantilly extra", price: 1000 },
  { id: "salsa", name: "Salsa extra", price: 1000 },
];

export const REMOVABLE_INGREDIENTS = [
  "Chantilly",
  "Salsa",
  "Granola",
  "Frutas",
  "Sprinkles",
  "Cerezas",
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
