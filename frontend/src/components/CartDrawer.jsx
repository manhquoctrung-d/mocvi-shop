import { useCart } from '../CartContext';
import { fmt } from '../api';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, total, dispatch } = useCart();

  const setQty = (id, qty) => dispatch({ type: 'SET_QTY', id, qty });
  const remove = (id)      => dispatch({ type: 'REMOVE', id });

  return (
    <>
      <div className={`overlay${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Giỏ hàng">
        <div className="drawer-head">
          <h3 style={{ fontFamily: 'var(--font-d)', fontWeight: 600 }}>Giỏ hàng của bạn</h3>
          <button className="close-x" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="big">🧺</div>
              <p>Giỏ đang trống.<br />Chọn vài món ngon nhé.</p>
            </div>
          ) : (
            items.map(({ product: p, qty }) => (
              <div className="cart-item" key={p.id}>
                <div className="cart-item-icon">{p.icon}</div>
                <div className="cart-info">
                  <h4>{p.name}</h4>
                  <span className="unit">{p.unit}</span>
                  <div className="cart-foot-row">
                    <div className="stepper">
                      <button onClick={() => setQty(p.id, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)}>+</button>
                    </div>
                    <span className="price-tag price-tag--sm">{fmt(p.price * qty)}</span>
                  </div>
                  <button className="remove-btn" onClick={() => remove(p.id)}>Xoá</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="subtotal-row">
              <span>Tạm tính</span>
              <span>{fmt(total)}</span>
            </div>
            <p className="small-note">Phí ship tính khi xác nhận đơn</p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { onClose(); onCheckout(); }}
            >
              Tiến hành đặt hàng →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
