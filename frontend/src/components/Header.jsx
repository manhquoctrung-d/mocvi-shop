import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';

export default function Header({ onCartOpen, onSearch }) {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link to="/" className="logo">
          Mộc Vị <sub>ĐẶC SẢN ĐÓNG GÓI</sub>
        </Link>

        <button
          className="icon-btn menu-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-label="Mở menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`} aria-label="Điều hướng">
          <ul onClick={() => setMenuOpen(false)}>
            <li><a href="#top">Trang chủ</a></li>
            <li><a href="#catalog">Sản phẩm</a></li>
            <li><a href="#why">Về chúng tôi</a></li>
            <li><a href="#footer">Liên hệ</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <label className="search-wrap" aria-label="Tìm kiếm">
            <span aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Tìm món bạn thích…"
              onChange={e => onSearch?.(e.target.value)}
              aria-label="Tìm sản phẩm"
            />
          </label>

          <button className="icon-btn" onClick={onCartOpen} aria-label="Mở giỏ hàng">
            🧺
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
