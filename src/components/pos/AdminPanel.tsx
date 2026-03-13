import { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { formatPrice, CATEGORIES as DEFAULT_CATS } from "@/data/products";
import type { Product, Flavor, Extra } from "@/types/pos";
import { Plus, Pencil, Trash2, Check, X, Settings } from "lucide-react";

type AdminTab = "products" | "flavors" | "extras" | "cash" | "stats";


export function AdminPanel() {
  const { categories, products, flavors, extras, orders, setProducts, setFlavors, setExtras, toggleFlavorAvailability, closeRegister } = usePOS();


  const [tab, setTab] = useState<AdminTab>("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddFlavor, setShowAddFlavor] = useState(false);
  const [showAddExtra, setShowAddExtra] = useState(false);

  // Archive view state
  const [viewingArchivedDate, setViewingArchivedDate] = useState<string | null>(null);

  // Product form

  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCategory, setPCategory] = useState(categories[0]?.id ?? "");
  const [pHasFlavors, setPHasFlavors] = useState(true);
  const [pMaxFlavors, setPMaxFlavors] = useState("1");

  // Flavor form
  const [fName, setFName] = useState("");
  const [fColor, setFColor] = useState("hsl(42 100% 72%)");

  // Extra form
  const [eName, setEName] = useState("");
  const [ePrice, setEPrice] = useState("");

  const resetProductForm = () => { setPName(""); setPPrice(""); setPCategory(categories[0]?.id ?? ""); setPHasFlavors(true); setPMaxFlavors("1"); };

  const currentDayOrders = orders.filter(o => o.status === 'completed' && !o.archived_date);
  const totalDaySales = currentDayOrders.reduce((sum, o) => sum + o.total, 0);

  const handleCloseRegister = () => {
    if (window.confirm(`¿Estás seguro de cerrar la caja de hoy? Ventas totales: ${formatPrice(totalDaySales)}`)) {
      closeRegister();
    }
  };

  // Group Archived Orders by Date
  const archivedOrders = orders.filter(o => o.status === 'completed' && o.archived_date);
  
  const archivedGroups: Record<string, { total: number; orderCount: number; dateStr: string }> = {};

  archivedOrders.forEach(o => {
    // Group by the day it was archived, ignoring time. 
    // archived_date is an ISO string, so we extract YYYY-MM-DD
    const dateKey = new Date(o.archived_date as Date | string).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    
    if (!archivedGroups[dateKey]) {
      archivedGroups[dateKey] = { total: 0, orderCount: 0, dateStr: dateKey };
    }
    archivedGroups[dateKey].total += o.total;
    archivedGroups[dateKey].orderCount += 1;
  });

  const archivedList = Object.values(archivedGroups).sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime()); // Rough sort by date string (might not be perfect down to the hour, but good enough for display)

  // Stats Logic

  const allCompletedOrders = orders.filter(o => o.status === 'completed');
  
  const productCount: Record<string, { count: number; name: string }> = {};
  const flavorCount: Record<string, { count: number; name: string }> = {};

  allCompletedOrders.forEach(order => {
    order.items.forEach(item => {
      // Products
      const pId = item.product.id;
      if (!productCount[pId]) productCount[pId] = { count: 0, name: item.product.name };
      productCount[pId].count += item.quantity;

      // Flavors
      if (item.product.hasFlavors && item.customization.flavors.length > 0) {
        item.customization.flavors.forEach(fId => {
          const flavorObj = flavors.find(f => f.id === fId);
          if (flavorObj) {
            if (!flavorCount[fId]) flavorCount[fId] = { count: 0, name: flavorObj.name };
            flavorCount[fId].count += item.quantity; // Each product bought counts as a vote for that flavor
          }
        });
      }
    });
  });

  const topProducts = Object.values(productCount).sort((a, b) => b.count - a.count).slice(0, 5);
  const topFlavors = Object.values(flavorCount).sort((a, b) => b.count - a.count).slice(0, 5);


  const handleAddProduct = () => {


    if (!pName.trim() || !pPrice) return;
    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      categoryId: pCategory,
      name: pName.trim(),
      price: parseInt(pPrice),
      hasFlavors: pHasFlavors,
      maxFlavors: parseInt(pMaxFlavors),
      available: true,
    };
    setProducts([...products, newProduct]);
    resetProductForm();
    setShowAddProduct(false);
  };

  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name.trim()) return;
    setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleAddFlavor = () => {
    if (!fName.trim()) return;
    setFlavors([...flavors, { id: `flavor-${Date.now()}`, name: fName.trim(), color: fColor, available: true }]);

    setFName(""); setShowAddFlavor(false);
  };

  const handleAddExtra = () => {
    if (!eName.trim() || !ePrice) return;
    setExtras([...extras, { id: `extra-${Date.now()}`, name: eName.trim(), price: parseInt(ePrice) }]);
    setEName(""); setEPrice(""); setShowAddExtra(false);
  };

  const handleDeleteFlavor = (id: string) => setFlavors(flavors.filter((f) => f.id !== id));
  const handleDeleteExtra = (id: string) => setExtras(extras.filter((e) => e.id !== id));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-900 text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Admin
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-3 flex-wrap">
        {(["products", "flavors", "extras", "cash", "stats"] as AdminTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 px-1 min-w-[30%] text-xs font-700 transition-all active:scale-95 ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t === "products" ? "Productos" : t === "flavors" ? "Sabores" : t === "extras" ? "Extras" : t === "cash" ? "Caja" : "Estadísticas"}
          </button>
        ))}
      </div>


      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* PRODUCTS TAB */}
        {tab === "products" && (
          <div className="space-y-3">
            {/* Group by category */}
            {categories.map((cat) => {
              const catProducts = products.filter((p) => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-border" style={{ background: cat.color + "15" }}>
                    <span>{cat.emoji}</span>
                    <span className="text-xs font-800 text-foreground">{cat.name}</span>
                  </div>
                  {catProducts.map((product) => (
                    <div key={product.id} className="px-3 py-2.5 border-b border-border last:border-0">
                      {editingProduct?.id === product.id ? (
                        <div className="space-y-2">
                          <input
                            className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                            />
                            <button onClick={handleSaveProduct} className="rounded-xl bg-success text-success-foreground px-3 py-2 active:scale-95">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingProduct(null)} className="rounded-xl bg-muted text-muted-foreground px-3 py-2 active:scale-95">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-700 text-foreground">{product.name}</p>
                            <p className="text-xs text-primary font-700">{formatPrice(product.price)}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center active:scale-95"
                            >
                              <Pencil className="w-3.5 h-3.5 text-secondary-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Add product */}
            {showAddProduct ? (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
                <h3 className="font-800 text-foreground text-sm">Nuevo producto</h3>
                <input
                  placeholder="Nombre del producto"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Precio (COP)"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                />
                <select
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-card"
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value)}
                >
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
                <label className="flex items-center gap-2 text-sm font-600">
                  <input type="checkbox" checked={pHasFlavors} onChange={(e) => setPHasFlavors(e.target.checked)} className="rounded" />
                  Tiene sabores
                </label>
                {pHasFlavors && (
                  <input
                    type="number"
                    placeholder="Máx. sabores"
                    min={1}
                    max={5}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={pMaxFlavors}
                    onChange={(e) => setPMaxFlavors(e.target.value)}
                  />
                )}
                <div className="flex gap-2">
                  <button onClick={handleAddProduct} className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-700 active:scale-95">
                    Guardar
                  </button>
                  <button onClick={() => { setShowAddProduct(false); resetProductForm(); }} className="rounded-xl bg-muted text-muted-foreground px-4 py-2.5 text-sm font-700 active:scale-95">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddProduct(true)}
                className="w-full rounded-2xl border-2 border-dashed border-primary/30 py-4 flex items-center justify-center gap-2 text-primary font-700 text-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Agregar producto
              </button>
            )}
          </div>
        )}

        {/* FLAVORS TAB */}
        {tab === "flavors" && (
          <div className="space-y-3">
            {flavors.map((flavor) => (
              <div key={flavor.id} className="bg-card rounded-2xl border border-border p-3 shadow-card flex items-center justify-between">
                {editingFlavor?.id === flavor.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={editingFlavor.name}
                      onChange={(e) => setEditingFlavor({ ...editingFlavor, name: e.target.value })}
                    />
                    <button onClick={() => { setFlavors(flavors.map((f) => f.id === editingFlavor.id ? editingFlavor : f)); setEditingFlavor(null); }} className="rounded-xl bg-success text-success-foreground px-3 py-2 active:scale-95">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingFlavor(null)} className="rounded-xl bg-muted px-3 py-2 active:scale-95">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full border-2 border-border shadow-sm" style={{ background: flavor.color }} />
                      <div className="flex flex-col">
                        <span className="font-700 text-foreground text-sm leading-tight">{flavor.name}</span>
                        <span className={`text-xs font-900 ${flavor.available ? 'text-success' : 'text-destructive'}`}>
                          {flavor.available ? 'DISPONIBLE' : 'AGOTADO'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Availability Toggle */}
                      <button
                        onClick={() => toggleFlavorAvailability(flavor.id, !flavor.available)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          flavor.available ? "bg-success" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            flavor.available ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <button onClick={() => setEditingFlavor(flavor)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center active:scale-95">

                        <Pencil className="w-3.5 h-3.5 text-secondary-foreground" />
                      </button>
                      <button onClick={() => handleDeleteFlavor(flavor.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center active:scale-95">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {showAddFlavor ? (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
                <h3 className="font-800 text-foreground text-sm">Nuevo sabor</h3>
                <input placeholder="Nombre del sabor" className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={fName} onChange={(e) => setFName(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleAddFlavor} className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-700 active:scale-95">Guardar</button>
                  <button onClick={() => setShowAddFlavor(false)} className="rounded-xl bg-muted text-muted-foreground px-4 py-2.5 text-sm font-700 active:scale-95">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddFlavor(true)} className="w-full rounded-2xl border-2 border-dashed border-primary/30 py-4 flex items-center justify-center gap-2 text-primary font-700 text-sm active:scale-95">
                <Plus className="w-4 h-4" /> Agregar sabor
              </button>
            )}
          </div>
        )}

        {/* EXTRAS TAB */}
        {tab === "extras" && (
          <div className="space-y-3">
            {extras.map((extra) => (
              <div key={extra.id} className="bg-card rounded-2xl border border-border p-3 shadow-card flex items-center justify-between">
                {editingExtra?.id === extra.id ? (
                  <div className="flex-1 flex gap-2">
                    <input className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={editingExtra.name} onChange={(e) => setEditingExtra({ ...editingExtra, name: e.target.value })} />
                    <input type="number" className="w-24 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={editingExtra.price} onChange={(e) => setEditingExtra({ ...editingExtra, price: parseInt(e.target.value) || 0 })} />
                    <button onClick={() => { setExtras(extras.map((e) => e.id === editingExtra.id ? editingExtra : e)); setEditingExtra(null); }} className="rounded-xl bg-success text-success-foreground px-3 py-2 active:scale-95"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingExtra(null)} className="rounded-xl bg-muted px-3 py-2 active:scale-95"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-700 text-foreground text-sm">{extra.name}</p>
                      <p className="text-xs text-primary font-700">+{formatPrice(extra.price)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingExtra(extra)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center active:scale-95"><Pencil className="w-3.5 h-3.5 text-secondary-foreground" /></button>
                      <button onClick={() => handleDeleteExtra(extra.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center active:scale-95"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {showAddExtra ? (
              <div className="bg-card rounded-2xl border border-border p-4 shadow-card space-y-3">
                <h3 className="font-800 text-foreground text-sm">Nuevo extra</h3>
                <input placeholder="Nombre del extra" className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={eName} onChange={(e) => setEName(e.target.value)} />
                <input type="number" placeholder="Precio adicional (COP)" className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={ePrice} onChange={(e) => setEPrice(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleAddExtra} className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-700 active:scale-95">Guardar</button>
                  <button onClick={() => setShowAddExtra(false)} className="rounded-xl bg-muted text-muted-foreground px-4 py-2.5 text-sm font-700 active:scale-95">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddExtra(true)} className="w-full rounded-2xl border-2 border-dashed border-primary/30 py-4 flex items-center justify-center gap-2 text-primary font-700 text-sm active:scale-95">
                <Plus className="w-4 h-4" /> Agregar extra
              </button>
            )}
          </div>
        )}

        {/* CASH TAB */}
        {tab === "cash" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
              <h3 className="text-sm font-800 text-muted-foreground uppercase tracking-wider mb-2">Ventas del Turno</h3>
              <p className="text-4xl font-900 text-primary">{formatPrice(totalDaySales)}</p>
              <p className="text-xs text-muted-foreground mt-2">{currentDayOrders.length} pedidos completados</p>
            </div>

            <button
              onClick={handleCloseRegister}
              disabled={currentDayOrders.length === 0}
              className="w-full py-4 rounded-2xl bg-destructive text-destructive-foreground font-800 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar Caja
            </button>
            <p className="text-xs text-muted-foreground text-center px-4">
              Al cerrar la caja, las ventas actuales se archivarán y dejarán la caja en $0 para el siguiente turno.
            </p>
            <div className="pt-6">
              <h3 className="text-lg font-900 text-foreground mb-4">Cierres Anteriores</h3>
              {archivedList.length > 0 ? (
                <div className="space-y-3">
                  {archivedList.map((group, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]" onClick={() => setViewingArchivedDate(group.dateStr)}>
                      <div>
                        <p className="font-800 text-sm text-foreground capitalize">{group.dateStr}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{group.orderCount} pedidos</p>
                      </div>
                      <p className="font-900 text-primary">{formatPrice(group.total)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 border border-border rounded-2xl py-8 text-center text-muted-foreground">
                  <p className="text-sm font-700">No hay cierres de caja anteriores.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {tab === "stats" && (
          <div className="space-y-6">
            <h3 className="text-xl font-900 text-foreground mb-4">Estadísticas (Histórico)</h3>

            
            <div className="space-y-4">
              <h4 className="text-sm font-800 text-muted-foreground uppercase tracking-wider">Top 5 Sabores Favoritos</h4>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                {topFlavors.length > 0 ? topFlavors.map((flavor, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-900">{idx + 1}</span>
                      <span className="font-700 text-sm text-foreground">{flavor.name}</span>
                    </div>
                    <span className="text-xs font-800 text-muted-foreground">{flavor.count} ped.</span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No hay datos suficientes.</p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-sm font-800 text-muted-foreground uppercase tracking-wider">Top 5 Productos Estrella</h4>
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
                {topProducts.length > 0 ? topProducts.map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center text-xs font-900">{idx + 1}</span>
                      <span className="font-700 text-sm text-foreground">{prod.name}</span>
                    </div>
                    <span className="text-xs font-800 text-muted-foreground">{prod.count} unid.</span>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No hay datos suficientes.</p>
                )}
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
