import { usePOS } from "@/context/POSContext";
import { formatPrice } from "@/data/products";
import type { Category, Product } from "@/types/pos";
import { ChevronLeft } from "lucide-react";

interface ProductListProps {
  category: Category;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

export function ProductList({ category, onBack, onSelectProduct }: ProductListProps) {
  const { products } = usePOS();
  const categoryProducts = products.filter((p) => p.categoryId === category.id);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-900 text-foreground flex items-center gap-2">
            <span>{category.emoji}</span> {category.name}
          </h1>
          <p className="text-xs text-muted-foreground">{categoryProducts.length} productos</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3 mt-2">
          {categoryProducts.map((product) => (
            <button
              key={product.id}
              className="product-card text-left flex items-center justify-between gap-3"
              onClick={() => onSelectProduct(product)}
              disabled={product.available === false}
            >
              <div className="flex-1">
                <p className="font-700 text-foreground leading-tight">{product.name}</p>
                {product.hasFlavors && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.maxFlavors === 1 ? "1 sabor" : `Hasta ${product.maxFlavors} sabores`}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className="text-base font-800 rounded-xl px-3 py-1.5 inline-block"
                  style={{ background: category.color + "22", color: category.color }}
                >
                  {formatPrice(product.price)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
