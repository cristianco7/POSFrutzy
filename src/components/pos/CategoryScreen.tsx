import { usePOS } from "@/context/POSContext";
import type { Category } from "@/types/pos";

interface CategoryScreenProps {
  onSelect: (category: Category) => void;
}

export function CategoryScreen({ onSelect }: CategoryScreenProps) {
  const { categories } = usePOS();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-900 text-foreground">Categorías</h1>
        <p className="text-sm text-muted-foreground">Selecciona una categoría</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mt-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="category-chip border border-border bg-card flex-col gap-2 h-28 shadow-card active:scale-95"
              onClick={() => onSelect(cat)}
              style={{ borderTop: `3px solid ${cat.color}` }}
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-sm font-700 text-foreground leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
