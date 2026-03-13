import { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import type { Order, OrderStatus } from "@/types/pos";
import { ChefHat, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; badgeClass: string }> = {
  pending: { label: "Pendiente", icon: Circle, badgeClass: "order-badge-pending" },
  preparing: { label: "Preparando", icon: ChefHat, badgeClass: "order-badge-preparing" },
  completed: { label: "Completado", icon: CheckCircle2, badgeClass: "order-badge-completed" },
};

function OrderCard({ order, flavors, extras }: { order: Order; flavors: ReturnType<typeof usePOS>["flavors"]; extras: ReturnType<typeof usePOS>["extras"] }) {
  const { updateOrderStatus } = usePOS();
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;

  const getFlavorNames = (ids: string[]) =>
    ids.map((id) => flavors.find((f) => f.id === id)?.name ?? id).join(", ");
  const getExtraNames = (ids: string[]) =>
    ids.map((id) => extras.find((e) => e.id === id)?.name ?? id).join(", ");

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between active:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-900 text-sm">#{order.orderNumber}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cfg.badgeClass}>
                <Icon className="w-3 h-3 inline mr-1" />
                {cfg.label}
              </span>
              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-lg text-[10px] font-800 uppercase">
                {order.location}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
            </p>

          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-900 text-foreground">{formatPrice(order.total)}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="border-t border-border pt-3 space-y-2 mb-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between gap-2 text-sm">
                <div>
                  <span className="font-700">{item.quantity}× {item.product.name}</span>
                  {item.customization.flavors.length > 0 && (
                    <p className="text-xs text-muted-foreground">🍦 {getFlavorNames(item.customization.flavors)}</p>
                  )}
                  {item.customization.extras.length > 0 && (
                    <p className="text-xs text-muted-foreground">➕ {getExtraNames(item.customization.extras)}</p>
                  )}
                  {item.customization.notes && (
                    <p className="text-xs text-muted-foreground italic">"{item.customization.notes}"</p>
                  )}
                </div>
                <span className="font-700 text-primary flex-shrink-0">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            {order.customerNote && (
              <p className="text-xs text-muted-foreground italic bg-muted rounded-lg px-2 py-1">
                📝 {order.customerNote}
              </p>
            )}
          </div>

          {/* Status actions */}
          {order.status !== "completed" && (
            <div className="flex gap-2">
              {order.status === "pending" && (
                <button
                  onClick={() => updateOrderStatus(order.id, "preparing")}
                  className="flex-1 rounded-xl bg-kitchen text-kitchen-foreground py-2.5 text-sm font-700 active:scale-95 transition-transform"
                >
                  <ChefHat className="w-4 h-4 inline mr-1.5" />
                  Preparando
                </button>
              )}
              {order.status === "preparing" && (
                <button
                  onClick={() => updateOrderStatus(order.id, "completed")}
                  className="flex-1 rounded-xl bg-success text-success-foreground py-2.5 text-sm font-700 active:scale-95 transition-transform"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                  Completado
                </button>
              )}
              {order.status === "pending" && (
                <button
                  onClick={() => updateOrderStatus(order.id, "completed")}
                  className="rounded-xl bg-muted text-muted-foreground px-3 py-2.5 text-sm font-700 active:scale-95"
                >
                  <Clock className="w-4 h-4 inline" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ActiveOrders() {
  const { orders, flavors, extras } = usePOS();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-900 text-foreground">Pedidos activos</h1>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {(["all", "pending", "preparing", "completed"] as const).map((f) => {
          const isActive = filter === f;
          const label = f === "all" ? `Todos (${orders.length})` : f === "pending" ? `Pendientes (${counts.pending})` : f === "preparing" ? `Preparando (${counts.preparing})` : `Listos (${counts.completed})`;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-700 transition-all active:scale-95 ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-4xl">🍦</span>
            <p className="text-sm text-muted-foreground font-600">No hay pedidos</p>
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} flavors={flavors} extras={extras} />
          ))
        )}
      </div>
    </div>
  );
}
