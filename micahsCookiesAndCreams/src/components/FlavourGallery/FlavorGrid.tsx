import type { FlavorSpec } from "../../types";
import { FlavorCard } from "./FlavorCard";

export interface FlavorSectionGroup {
  id: string;
  label: string;
  color?: string;
  items: FlavorSpec[];
}

interface FlavorGridProps {
  sections: FlavorSectionGroup[];
  sizeOptions: string[];
  getFlavorPrice?: (flavor: FlavorSpec, size: string, lactoseFree?: boolean) => number;
  onCustomize?: (flavor: FlavorSpec, size: string, quantity: number, lactoseFree: boolean) => void;
  onAddToCart?: (flavor: FlavorSpec, size: string, quantity: number, lactoseFree: boolean) => void;
}

export function FlavorGrid({ sections, sizeOptions, getFlavorPrice, onCustomize, onAddToCart }: FlavorGridProps) {
  return (
    <div className="flavor-section-list" aria-label="Flavor gallery">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="flavor-section"
          style={section.color ? { backgroundColor: section.color, borderColor: section.color } : undefined}
        >
          <div className="sticky-header">
            <h3>{section.label}</h3>
          </div>

          <div className="flavor-grid">
            {section.items.map((flavor) => (
              <FlavorCard
                key={flavor.id || flavor.name}
                flavor={flavor}
                sizeOptions={sizeOptions}
                getFlavorPrice={getFlavorPrice}
                onCustomize={onCustomize}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default FlavorGrid;
