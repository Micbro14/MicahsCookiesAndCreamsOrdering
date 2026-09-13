import { useMemo, useState } from "react";
import type { FlavorSpec } from "../../types";

interface FlavorCardProps {
  flavor: FlavorSpec;
  sizeOptions: string[];
  selectedSize?: string;
  getFlavorPrice?: (flavor: FlavorSpec, size: string, lactoseFree?: boolean) => number;
  onSelectSize?: (size: string) => void;
  onCustomize?: (flavor: FlavorSpec, size: string, quantity: number, lactoseFree: boolean) => void;
  onAddToCart?: (flavor: FlavorSpec, size: string, quantity: number, lactoseFree: boolean) => void;
}

export function FlavorCard({
  flavor,
  sizeOptions,
  selectedSize,
  getFlavorPrice,
  onSelectSize,
  onCustomize,
  onAddToCart,
}: FlavorCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [lactoseFree, setLactoseFree] = useState(false);

  const imageUrl = useMemo(
    () => `./images/${String(flavor.id || flavor.name)}.png`,
    [flavor]
  );

  const activeSize = selectedSize ?? sizeOptions[0] ?? "";

  const price = useMemo(() => {
    if (!activeSize) return "$0.00";
    const computed = getFlavorPrice ? getFlavorPrice(flavor, activeSize, lactoseFree) : 0;
    return `$${computed.toFixed(2)}`;
  }, [activeSize, flavor, getFlavorPrice, lactoseFree]);

  return (
    <article className="flavor-card">
      <img src={imageUrl} alt={flavor.name} className="card-image" />

      <div className="card-body">
        <h3 className="card-title">{flavor.name}</h3>
        <p className="card-description">{flavor.description || "Classic favorite."}</p>

        <div className="size-options" role="radiogroup" aria-label={`${flavor.name} size options`}>
          {sizeOptions.map((size) => (
            <label key={size} className={`size-option ${activeSize === size ? "active" : ""}`}>
              <input
                type="radio"
                name={`size-${flavor.id || flavor.name}`}
                value={size}
                checked={activeSize === size}
                onChange={() => onSelectSize?.(size)}
              />
              <span>{size}</span>
            </label>
          ))}
        </div>

        <div className="card-actions-row">
          <label className="quantity-control">
            <span>Qty</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={lactoseFree}
              onChange={(event) => setLactoseFree(event.target.checked)}
            />
            Lactose Free
          </label>
        </div>

        <div className="card-footer">
          <strong className="card-price">{price}</strong>

          <div className="button-stack">
            <button
              type="button"
              className="secondary-button"
              onClick={() => onCustomize?.(flavor, activeSize, quantity, lactoseFree)}
            >
              Customize It!
            </button>

            <button
              type="button"
              className="primary-button small"
              onClick={() => onAddToCart?.(flavor, activeSize, quantity, lactoseFree)}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FlavorCard;
