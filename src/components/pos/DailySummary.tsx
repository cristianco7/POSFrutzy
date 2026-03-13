import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import { TrendingUp, ShoppingBag, CheckCircle2, Clock } from "lucide-react";

export function DailySummary() {
  const { orders, categories, products } = usePOS();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => o.createdAt >= today);
  const completedToday = todayOrders.filter((o) => o.status === "completed");
  const dailyRevenue = completedToday.reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = todayOrders
    .filter((o) => o.status !== "completed")
    .reduce((sum, o) => sum + o.total, 0);

  // Top products today
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  todayOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = { name: item.product.name, qty: 0, revenue: 0 };
      }
      productSales[item.product.id].qty += item.quantity;
      productSales[item.product.id].revenue += item.totalPrice;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Category breakdown
  const catSales: Record<string, { name: string; emoji: string; revenue: number }> = {};
  todayOrders.forEach((order) => {
    order.items.forEach((item) => {
      const cat = categories.find((c) => c.id === item.product.categoryId);
      if (!cat) return;
      if (!catSales[cat.id]) catSales[cat.id] = { name: cat.name, emoji: cat.emoji, revenue: 0 };
      catSales[cat.id].revenue += item.totalPrice;
    });
  });
  const catBreakdown = Object.values(catSales).sort((a, b) => b.revenue - a.revenue);

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-600">{label}</p>
        <p className="text-lg font-900 text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-900 text-foreground">Resumen del día</h1>
        <p className="text-sm text-muted-foreground">
          {today.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={TrendingUp}
            label="Ventas confirmadas"
            value={formatPrice(dailyRevenue)}
            color="hsl(145 60% 45%)"
          />
          <StatCard
            icon={Clock}
            label="En proceso"
            value={formatPrice(pendingRevenue)}
            color="hsl(38 95% 55%)"
          />
          <StatCard
            icon={ShoppingBag}
            label="Pedidos totales"
            value={String(todayOrders.length)}
            color="hsl(350 72% 56%)"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completados"
            value={String(completedToday.length)}
            color="hsl(220 60% 55%)"
          />
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <h2 className="font-800 text-foreground text-sm mb-3">🏆 Productos más vendidos</h2>
            <div className="space-y-2">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-900 text-muted-foreground w-4">{idx + 1}</span>
                    <span className="text-sm font-600 text-foreground">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-800 text-primary">{formatPrice(p.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} uds</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {catBreakdown.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
            <h2 className="font-800 text-foreground text-sm mb-3">📊 Por categoría</h2>
            <div className="space-y-2">
              {catBreakdown.map((c, idx) => {
                const pct = dailyRevenue > 0 ? (c.revenue / (dailyRevenue + pendingRevenue)) * 100 : 0;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-600 text-foreground">{c.emoji} {c.name}</span>
                      <span className="font-800 text-primary">{formatPrice(c.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-hero rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {todayOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-5xl">📊</span>
            <p className="text-base font-800 text-foreground">Sin ventas aún hoy</p>
            <p className="text-sm text-muted-foreground">Los datos aparecerán al registrar pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
}
