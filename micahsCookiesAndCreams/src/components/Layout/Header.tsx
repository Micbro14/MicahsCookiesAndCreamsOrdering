import { useCartContext } from "../../context/CartContext";

interface HeaderProps {
  onCartToggle?: () => void;
}

export function Header({ onCartToggle }: HeaderProps) {
  const { totalItems } = useCartContext();

  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true">MC</div>
        <div>
          <p className="eyebrow">Artisan Ice Cream</p>
          <h1>Micah&apos;s Cookies &amp; Creams</h1>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="primary-button">
          Craft A Flavor
        </button>

        <button type="button" className="ghost-button" aria-label="Toggle dark mode">
          Dark Mode
        </button>

        <button type="button" className="cart-button" aria-label="Open shopping cart" onClick={onCartToggle}>
          Cart
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </button>
      </div>
    </header>
  );
}

export default Header;
