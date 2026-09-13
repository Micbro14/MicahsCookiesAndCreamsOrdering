import { useCartContext } from "../../context/CartContext";
import { CartItem } from "./CartItem";

interface CartSidebarProps {
  onCheckout?: () => void;
}

export function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { items, subtotal, updateItem, removeItem, clearCart } = useCartContext();

  return (
    <aside className="cart-sidebar" aria-label="Shopping cart">
      <div className="cart-header-row">
        <h3>Shopping Cart</h3>
        {items.length > 0 && (
          <button type="button" className="link-button" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={(id, quantity) => updateItem(id, { quantity })}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="cart-summary">
            <div>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <button type="button" className="primary-button small" onClick={onCheckout}>
              Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default CartSidebar;
