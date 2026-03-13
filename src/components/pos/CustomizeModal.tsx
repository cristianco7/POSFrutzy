import { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import type { Product, CartItem } from "@/types/pos";
import { ChevronLeft, Plus, Minus, ShoppingCart, Check } from "lucide-react";

interface CustomizeModalProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function CustomizeModal({ product, onBack, onAddToCart }: CustomizeModalProps) {
  const { flavors, extras } = usePOS();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const maxFlavors = product.maxFlavors ?? 1;

  const toggleFlavor = (id: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= maxFlavors) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const extrasTotal = extras
    .filter((e) => selectedExtras.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);

  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const item: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity,
      customization: {
        flavors: selectedFlavors,
        extras: selectedExtras,
        removedIngredients: [],
        notes,
      },
      unitPrice,
      totalPrice,
    };
    onAddToCart(item);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-900 text-foreground">{product.name}</h1>
          <p className="text-sm text-primary font-700">{formatPrice(product.price)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {/* Flavors */}
        {product.hasFlavors && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-800 text-foreground text-sm">
                Sabor{maxFlavors > 1 ? "es" : ""}
              </h2>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {selectedFlavors.length}/{maxFlavors}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {flavors.map((flavor) => {
                const selected = selectedFlavors.includes(flavor.id);
                return (
                  <button
                    key={flavor.id}
                    onClick={() => flavor.available && toggleFlavor(flavor.id)}
                    disabled={!flavor.available}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border-2 transition-all duration-150 ${
                      !flavor.available
                        ? "opacity-40 grayscale-[0.5] border-muted bg-muted/20 cursor-not-allowed"
                        : selected
                        ? "border-primary bg-secondary active:scale-95"
                        : "border-border bg-card active:scale-95"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center"
                      style={{ background: flavor.color }}
                    >
                      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <div className="flex flex-col items-start translate-y-[1px]">
                      <span className={`text-sm font-600 leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
                        {flavor.name}
                      </span>
                      {!flavor.available && (
                        <span className="text-[9px] font-900 text-destructive uppercase tracking-tighter">AGOTADO</span>
                      )}
                    </div>
                  </button>

                );
              })}
            </div>
          </div>
        )}

        {/* Extras */}
        <div>
          <h2 className="font-800 text-foreground text-sm mb-2">Extras (opcionales)</h2>
          <div className="flex flex-col gap-2">
            {extras.map((extra) => {
              const selected = selectedExtras.includes(extra.id);
              return (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 border-2 transition-all duration-150 active:scale-95 ${
                    selected ? "border-accent bg-accent/10" : "border-border bg-card"
                  }`}
                >
                  <span className={`text-sm font-600 ${selected ? "text-foreground" : "text-foreground"}`}>
                    {extra.name}
                  </span>
                  <span className={`text-xs font-700 rounded-lg px-2 py-0.5 ${selected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    +{formatPrice(extra.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="font-800 text-foreground text-sm mb-2">Notas (opcional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Sin crema, extra salsa..."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            rows={2}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-2 border-t border-border bg-background">
        {/* Quantity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-700 text-muted-foreground">Cantidad</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-95"
            >
              <Minus className="w-4 h-4 text-secondary-foreground" />
            </button>
            <span className="text-xl font-800 w-6 text-center text-foreground">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-95"
            >
              <Plus className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full rounded-2xl py-4 flex items-center justify-between px-5 bg-gradient-hero text-primary-foreground font-800 text-base active:scale-95 transition-transform shadow-fab"
        >
          <span className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Agregar al pedido
          </span>
          <span>{formatPrice(totalPrice)}</span>
        </button>
      </div>
    </div>
  );
}
