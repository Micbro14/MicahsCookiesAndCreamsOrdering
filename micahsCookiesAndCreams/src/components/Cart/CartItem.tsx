import { useState } from "react";
import type { CartItemType } from "../../types";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="cart-item">
      <div className="cart-item-header">
        <div>
          <h4>{item.flavorName}</h4>
          <p>
            {item.sizeName} • {item.isLactoseFree ? "Lactose Free" : "Standard"}
          </p>
        </div>

        <div className="cart-item-actions">
          <button type="button" className="link-button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Hide" : "Details"}
          </button>
          <button type="button" className="link-button danger" onClick={() => onRemove?.(item.id)}>
            Remove
          </button>
        </div>
      </div>

      <div className="cart-item-meta">
        <label>
          Qty
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(event) => onQuantityChange?.(item.id, Number(event.target.value) || 1)}
          />
        </label>

        <strong>${item.totalPrice.toFixed(2)}</strong>
      </div>

      {expanded && (
        <div className="cart-item-details">
          {item.ingredients && item.ingredients.length > 0 ? (
            <ul>
              {item.ingredients.map((ingredient, index) => (
                <li key={`${ingredient.name}-${index}`}>
                  <span>{ingredient.name}</span>
                  <span>{ingredient.label ?? ingredient.amount ?? ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredient list saved for this item.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CartItem;
