import { useState } from 'react';
import { useCart } from '../CartContext';
import { fmt, CATEGORIES, BADGE_MAP } from '../api';

export default function QuickView({ product, onClose, onAddedToCart }) {
  const { dispatch } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const cat = CATEGORIES.find(c => c.id === product.category)?.name || product.category;
  const badge = product.badge && BADGE_MAP[product.badge];

  function handleAdd() {
    dispatch({ type: 'ADD', product, qty });
    onAddedToCart?.();
    onClose();
  }

  return (
    <>
      <div className="overlay show" onClick={onClose} />
      <div className="modal open" role="dialog" aria-label={product.name}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">×</button>

        <div className="qv-media" aria-hidden="true">
          {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
          {product.icon}
        </div>

        <p className="eyebrow">{cat}</p>
        <h2 style={{ fontSize: '1.5rem', marginTop: '.3rem' }}>{product.name}</h2>
        <p style={{ fontFamily: 'var(--font-m)', fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: '.2rem' }}>
          {product.unit}
        </p>
        <p className="qv-desc">{product.description}</p>

        <span className="price-tag">
          {product.old_price && <span className="old-price">{fmt(product.old_price)}</span>}
          {fmt(product.price)}
        </span>

        <div className="qv-actions">
          <div className="stepper">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </>
  );
}
