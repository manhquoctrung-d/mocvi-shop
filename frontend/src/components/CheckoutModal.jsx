import { useState } from 'react';
import { useCart } from '../CartContext';
import { api, fmt } from '../api';

const BANK = {
  name: 'Vietcombank',
  account: '1234 5678 9012 345',
  holder: 'NGUYEN VAN A',
  branch: 'Chi nhánh TP. Hồ Chí Minh',
};

export default function CheckoutModal({ open, onClose }) {
  const { items, total, dispatch } = useCart();
  const [pay, setPay]     = useState('cod');
  const [form, setForm]   = useState({ name: '', phone: '', address: '', note: '' });
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState('');
  const [success, setSuccess] = useState(null);

  if (!open) return null;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return setError('Vui lòng điền đầy đủ thông tin.');
    setLoad(true); setError('');
    try {
      const result = await api.createOrder({
        customer_name:  form.name,
        phone:          form.phone,
        address:        form.address,
        note:           form.note,
        payment_method: pay,
        items: items.map(i => ({ product_id: i.product.id, quantity: i.qty })),
      });
      setSuccess(result);
      dispatch({ type: 'CLEAR' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoad(false);
    }
  }

  function handleClose() {
    setSuccess(null); setError(''); setForm({ name: '', phone: '', address: '', note: '' }); setPay('cod');
    onClose();
  }

  return (
    <>
      <div className="overlay show" onClick={handleClose} />
      <div className="modal open" role="dialog" aria-label="Đặt hàng">
        <button className="modal-close" onClick={handleClose}>×</button>

        {success ? (
          <div className="success-box">
            <div className="big">✅</div>
            <h2 style={{ fontSize: '1.3rem' }}>Đặt hàng thành công!</h2>
            <p className="order-code">{success.code}</p>
            <p style={{ color: 'var(--ink-soft)', marginTop: '.5rem', fontSize: '.94rem' }}>
              Lưu lại mã đơn để tra cứu. Mộc Vị sẽ gọi xác nhận trong <strong>30 phút</strong>.
            </p>
            {pay === 'bank' && (
              <div className="bank-info" style={{ marginTop: '1.2rem', textAlign: 'left' }}>
                <strong>Chuyển khoản ngay để được xử lý ưu tiên:</strong>
                <p>{BANK.name} — TK <strong>{BANK.account}</strong></p>
                <p>Chủ tài khoản: <strong>{BANK.holder}</strong></p>
                <p>Nội dung: <strong>{success.code} - {form.phone}</strong></p>
              </div>
            )}
            <button className="btn btn-primary" style={{ marginTop: '1.4rem' }} onClick={handleClose}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.2rem' }}>Hoàn tất đặt hàng</h2>

            {/* Tóm tắt giỏ hàng */}
            <div className="checkout-summary">
              {items.map(({ product: p, qty }) => (
                <div className="row" key={p.id}>
                  <span>{p.icon} {p.name} × {qty}</span>
                  <span>{fmt(p.price * qty)}</span>
                </div>
              ))}
              <div className="row total-row">
                <span>Tạm tính</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="payment-tabs">
              <button className={`pay-tab${pay === 'cod' ? ' active' : ''}`} onClick={() => setPay('cod')}>
                🛵 Giao hàng — thu tiền
              </button>
              <button className={`pay-tab${pay === 'bank' ? ' active' : ''}`} onClick={() => setPay('bank')}>
                🏦 Chuyển khoản
              </button>
            </div>

            {pay === 'bank' && (
              <div className="bank-info">
                <strong>Thông tin chuyển khoản:</strong>
                <p>{BANK.name} — TK: <strong>{BANK.account}</strong></p>
                <p>Chủ TK: <strong>{BANK.holder}</strong> — {BANK.branch}</p>
                <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginTop: '.4rem' }}>
                  Nội dung ghi: [Mã đơn] — [Số điện thoại] (hiển thị sau khi đặt thành công)
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {error && <p style={{ color: 'var(--red)', marginBottom: '.8rem', fontSize: '.88rem' }}>{error}</p>}

              <div className="field">
                <label htmlFor="co-name">Họ và tên *</label>
                <input id="co-name" name="name" required value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Số điện thoại *</label>
                <input id="co-phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="09xx xxx xxx" />
              </div>
              <div className="field">
                <label htmlFor="co-address">Địa chỉ nhận hàng *</label>
                <input id="co-address" name="address" required value={form.address} onChange={handleChange} placeholder="Số nhà, đường, quận/huyện, tỉnh/thành" />
              </div>
              <div className="field">
                <label htmlFor="co-note">Ghi chú</label>
                <textarea id="co-note" name="note" rows={2} value={form.note} onChange={handleChange} placeholder="Giao giờ hành chính, gọi trước khi giao…" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Đang xử lý…' : 'Xác nhận đặt hàng'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
