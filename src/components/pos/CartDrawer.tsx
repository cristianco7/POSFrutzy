import { ShoppingCart, X } from "lucide-react";
import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import { OrderSummary } from "./OrderSummary";

interface CartFabProps {
  onOpen: () => void;
}

export function CartFab({ onOpen }: CartFabProps) {
  const { cartCount, cartTotal } = usePOS();
  if (cartCount === 0) return null;

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-20 right-4 z-30 flex items-center gap-3 rounded-2xl bg-gradient-hero text-primary-foreground px-4 py-3 shadow-fab active:scale-95 transition-transform animate-slide-up"
    >
      <div className="relative">
        <ShoppingCart className="w-5 h-5" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-accent-foreground rounded-full text-xs font-900 flex items-center justify-center">
          {cartCount}
        </span>
      </div>
      <span className="font-800 text-sm">{formatPrice(cartTotal)}</span>
    </button>
  );
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
}

export function CartDrawer({ open, onClose, onOrderPlaced }: CartDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-t-3xl max-h-[92vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <OrderSummary onClose={onClose} onOrderPlaced={onOrderPlaced} />
        </div>
      </div>
    </div>
  );
}
