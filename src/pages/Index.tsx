import { useState } from "react";
import { POSProvider } from "@/context/POSContext";
import { CategoryScreen } from "@/components/pos/CategoryScreen";
import { ProductList } from "@/components/pos/ProductList";
import { CustomizeModal } from "@/components/pos/CustomizeModal";
import { ActiveOrders } from "@/components/pos/ActiveOrders";
import { KitchenView } from "@/components/pos/KitchenView";
import { DailySummary } from "@/components/pos/DailySummary";
import { AdminPanel } from "@/components/pos/AdminPanel";
import { CartFab, CartDrawer } from "@/components/pos/CartDrawer";
import type { Category, Product, CartItem } from "@/types/pos";
import { usePOS } from "@/context/POSContext";
import { IceCream2, ShoppingBag, ChefHat, BarChart3, Settings } from "lucide-react";

type POSScreen = "categories" | "products" | "customize";
type Tab = "pos" | "orders" | "kitchen" | "summary" | "admin";

const NAV_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "pos", label: "POS", icon: IceCream2 },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "kitchen", label: "Cocina", icon: ChefHat },
  { id: "summary", label: "Resumen", icon: BarChart3 },
  { id: "admin", label: "Admin", icon: Settings },
];

function POSTab() {
  const { addToCart } = usePOS();
  const [screen, setScreen] = useState<POSScreen>("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setScreen("products");
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setScreen("customize");
  };

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    setScreen("products");
  };

  const handleOrderPlaced = () => {
    setCartOpen(false);
    setScreen("categories");
    setSelectedCategory(null);
    setSelectedProduct(null);
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {screen === "categories" && <CategoryScreen onSelect={handleCategorySelect} />}
        {screen === "products" && selectedCategory && (
          <ProductList
            category={selectedCategory}
            onBack={() => setScreen("categories")}
            onSelectProduct={handleProductSelect}
          />
        )}
        {screen === "customize" && selectedProduct && (
          <CustomizeModal
            product={selectedProduct}
            onBack={() => setScreen("products")}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>

      <CartFab onOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onOrderPlaced={handleOrderPlaced} />
    </div>
  );
}

function AppShell() {
  const [tab, setTab] = useState<Tab>("pos");
  const { cartCount, orders } = usePOS();
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-background overflow-hidden">

      {/* Content area */}
      <div className="flex-1 overflow-hidden relative">
        {tab === "pos" && <POSTab />}
        {tab === "orders" && <ActiveOrders />}
        {tab === "kitchen" && <KitchenView />}
        {tab === "summary" && <DailySummary />}
        {tab === "admin" && <AdminPanel />}
      </div>

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 border-t border-border bg-card px-2 pb-safe">
        <div className="flex">
          {NAV_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = tab === id;
            const badge = id === "orders" ? pendingCount : id === "kitchen" ? pendingCount : 0;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors active:scale-95 ${
                  isActive ? "tab-active" : "tab-inactive"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full text-[10px] font-900 flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-700 ${isActive ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function Index() {
  return (
    <POSProvider>
      <AppShell />
    </POSProvider>
  );
}
