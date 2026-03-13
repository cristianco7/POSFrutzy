import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import type { Order } from "@/types/pos";
import { ChefHat, CheckCircle2 } from "lucide-react";

function KitchenCard({ order, flavors, extras }: { order: Order; flavors: ReturnType<typeof usePOS>["flavors"]; extras: ReturnType<typeof usePOS>["extras"] }) {
  const { updateOrderStatus } = usePOS();

  const getFlavorNames = (ids: string[]) =>
    ids.map((id) => flavors.find((f) => f.id === id)?.name ?? id).join(", ");
  const getExtraNames = (ids: string[]) =>
    ids.map((id) => extras.find((e) => e.id === id)?.name ?? id).join(", ");

  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);


  return (
    <div
      className={`rounded-3xl border-2 p-4 shadow-card ${
        order.status === "pending"
          ? "border-warning bg-warning/5"
          : "border-kitchen bg-kitchen/5"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              order.status === "pending" ? "bg-warning text-warning-foreground" : "bg-kitchen text-kitchen-foreground"
            }`}
          >
            <span className="font-900 text-xl">#{order.orderNumber}</span>
          </div>
          <div>
            <p className={`text-xs font-700 ${order.status === "pending" ? "text-warning" : "text-kitchen"}`}>
              {order.status === "pending" ? "⏳ PENDIENTE" : "👨‍🍳 PREPARANDO"}
            </p>
            <p className="text-xs text-muted-foreground">{elapsed}min · {order.items.length} prod.</p>
          </div>
        </div>
        <span className="text-xl font-900 text-foreground">{formatPrice(order.total)}</span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="bg-card rounded-xl p-2.5 border border-border">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-800 flex-shrink-0">
                {item.quantity}
              </span>
              <span className="font-700 text-foreground text-sm">{item.product.name}</span>
            </div>
            {item.customization.flavors.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 ml-9">🍦 {getFlavorNames(item.customization.flavors)}</p>
            )}
            {item.customization.extras.length > 0 && (
              <p className="text-xs text-muted-foreground ml-9">➕ {getExtraNames(item.customization.extras)}</p>
            )}
            {item.customization.notes && (
              <p className="text-xs text-primary font-600 ml-9 italic">"{item.customization.notes}"</p>
            )}
          </div>
        ))}
      </div>

      {order.customerNote && (
        <p className="text-xs text-muted-foreground italic bg-muted rounded-xl px-3 py-2 mb-3">
          📝 {order.customerNote}
        </p>
      )}

      {/* Action */}
      {order.status === "pending" ? (
        <button
          onClick={() => updateOrderStatus(order.id, "preparing")}
          className="w-full rounded-2xl bg-kitchen text-kitchen-foreground py-3 font-800 text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <ChefHat className="w-4 h-4" />
          Iniciar preparación
        </button>
      ) : (
        <button
          onClick={() => updateOrderStatus(order.id, "completed")}
          className="w-full rounded-2xl bg-success text-success-foreground py-3 font-800 text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Marcar como listo ✓
        </button>
      )}
    </div>
  );
}

export function KitchenView() {
  const { orders, flavors, extras } = usePOS();
  const active = orders.filter((o) => o.status === "pending" || o.status === "preparing");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-900 text-foreground flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-kitchen" />
            Cocina
          </h1>
          <p className="text-sm text-muted-foreground">{active.length} pedidos activos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <span className="text-6xl">✅</span>
            <p className="text-lg font-800 text-foreground">¡Todo listo!</p>
            <p className="text-sm text-muted-foreground">No hay pedidos pendientes</p>
          </div>
        ) : (
          active.map((order) => (
            <KitchenCard key={order.id} order={order} flavors={flavors} extras={extras} />
          ))
        )}
      </div>
    </div>
  );
}
