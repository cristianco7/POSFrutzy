import { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import { Minus, Plus, Trash2, Send, X, ChevronDown } from "lucide-react";

interface OrderSummaryProps {
  onClose: () => void;
  onOrderPlaced: () => void;
}

export function OrderSummary({ onClose, onOrderPlaced }: OrderSummaryProps) {
  const { cart, cartTotal, removeFromCart, updateCartItemQuantity, placeOrder, flavors, extras } = usePOS();
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const [isPlacing, setIsPlacing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Para llevar");

  const locations = [
    { id: "takeaway", label: "Para llevar", icon: "🥡" },
    ...Array.from({ length: 8 }, (_, i) => ({ id: `mesa-${i + 1}`, label: `Mesa ${i + 1}`, icon: "🪑" })),
    ...Array.from({ length: 4 }, (_, i) => ({ id: `barra-${i + 1}`, label: `Barra ${i + 1}`, icon: "🍺" })),
  ];

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || isPlacing) return;
    setIsPlacing(true);
    const order = await placeOrder(selectedLocation, note || undefined);
    setIsPlacing(false);


    if (order) {
      onOrderPlaced();
    } else {
      // In a real app we'd show an error toast here
      alert("Error al enviar el pedido. Por favor intente de nuevo.");
    }
  };


  const getFlavorNames = (ids: string[]) =>
    ids.map((id) => flavors.find((f) => f.id === id)?.name ?? id).join(", ");

  const getExtraNames = (ids: string[]) =>
    ids.map((id) => extras.find((e) => e.id === id)?.name ?? id).join(", ");

  if (cart.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 px-8 text-center">
        <span className="text-6xl">🛒</span>
        <p className="text-lg font-800 text-foreground">Carrito vacío</p>
        <p className="text-sm text-muted-foreground">Agrega productos para crear un pedido</p>
        <button
          onClick={onClose}
          className="mt-2 rounded-2xl bg-primary text-primary-foreground px-6 py-3 font-700 active:scale-95"
        >
          Ir al menú
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-900 text-foreground">Resumen del pedido</h1>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-95"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-card rounded-2xl border border-border p-3 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-700 text-foreground text-sm leading-tight">{item.product.name}</p>
                {item.customization.flavors.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    🍦 {getFlavorNames(item.customization.flavors)}
                  </p>
                )}
                {item.customization.extras.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ➕ {getExtraNames(item.customization.extras)}
                  </p>
                )}
                {item.customization.notes && (
                  <p className="text-xs text-muted-foreground italic">"{item.customization.notes}"</p>
                )}
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center active:scale-95 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-800 w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-800 text-primary">{formatPrice(item.totalPrice)}</span>
            </div>
          </div>
        ))}

        {/* Note toggle */}
        <button
          onClick={() => setShowNote((v) => !v)}
          className="w-full flex items-center gap-2 text-sm text-muted-foreground font-600 py-1"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showNote ? "rotate-180" : ""}`} />
          Agregar nota al pedido
        </button>
        {showNote && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Instrucciones especiales para el pedido..."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={2}
          />
        )}

        <div className="pt-2">
          <p className="text-xs font-900 text-muted-foreground uppercase mb-2 ml-1">Ubicación del pedido</p>
          <div className="grid grid-cols-3 gap-2 pb-4">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.label)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${
                  selectedLocation === loc.label
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card border-border border-dashed opacity-70"
                }`}
              >
                <span className="text-lg mb-0.5">{loc.icon}</span>
                <span className={`text-[10px] font-800 ${selectedLocation === loc.label ? "text-primary" : "text-muted-foreground"}`}>
                  {loc.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Total + Submit */}
      <div className="px-4 pb-6 pt-3 border-t border-border bg-background">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-700 text-muted-foreground">Total</span>
          <span className="text-2xl font-900 text-foreground">{formatPrice(cartTotal)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isPlacing}
          className={`w-full rounded-2xl py-4 flex items-center justify-center gap-3 bg-gradient-hero text-primary-foreground font-800 text-base active:scale-95 transition-transform shadow-fab ${isPlacing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Send className="w-5 h-5" />
          {isPlacing ? "Enviando..." : "Enviar a cocina"}
        </button>

      </div>
    </div>
  );
}
