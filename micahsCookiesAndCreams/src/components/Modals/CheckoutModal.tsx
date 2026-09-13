import { useCartContext } from "../../context/CartContext";
import { ModalShell } from "./ModalShell";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCartContext();

  const handleSubmit = () => {
    clearCart();
    onClose();
  };

  return (
    <ModalShell isOpen={isOpen} title="Checkout" onClose={onClose}>
      <div className="checkout-order-summary">
        {items.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <>
            <div className="checkout-list">
              {items.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div>
                    <strong>{item.flavorName}</strong>
                    <small>
                      {item.quantity} × {item.sizeName}
                    </small>
                  </div>
                  <span>${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-total">
              <span>Total</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>

      <form className="checkout-form">
        <label>
          Name
          <input type="text" placeholder="Your name" />
        </label>

        <label>
          Email
          <input type="email" placeholder="your@email.com" />
        </label>

        <label>
          Delivery Notes
          <textarea rows={4} placeholder="Pickup or delivery details" />
        </label>
      </form>

      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="primary-button small" onClick={handleSubmit}>
          Submit Order
        </button>
      </div>
    </ModalShell>
  );
}

export default CheckoutModal;
