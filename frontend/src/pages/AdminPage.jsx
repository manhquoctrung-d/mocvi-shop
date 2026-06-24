import { useState, useEffect, useCallback } from 'react';
import { api, fmt, STATUS_MAP, CATEGORIES, BADGE_MAP } from '../api';

/* ── Helpers ── */
const statusOptions = [
  { v: 'new',       l: 'Mới' },
  { v: 'confirmed', l: 'Đã xác nhận' },
  { v: 'shipping',  l: 'Đang giao' },
  { v: 'delivered', l: 'Đã giao' },
  { v: 'cancelled', l: 'Đã huỷ' },
];

/* ── Login Screen ── */
function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr]   = useState('');
  const [loading, setL] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setErr(''); setL(true);
    try {
      const { token } = await api.adminLogin(form);
      localStorage.setItem('mocvi_token', token);
      onLogin();
    } catch (e) { setErr(e.message); }
    finally { setL(false); }
  }

  return (
    <div className="admin-login">
      <div className="login-box">
        <a href="/" className="logo" style={{ marginBottom: '1.2rem', display: 'block' }}>Mộc Vị</a>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.4rem' }}>Đăng nhập quản trị</h2>
        {err && <p className="err-msg">{err}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Tên đăng nhập<input name="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></label></div>
          <div className="field"><label>Mật khẩu<input name="password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required /></label></div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Stats Tab ── */
function StatsPanel() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.getStats().then(setStats).catch(() => {}); }, []);
  if (!stats) return <p>Đang tải…</p>;
  return (
    <div className="stats-grid">
      <div className="stat-card red"><h3>Đơn mới chờ xử lý</h3><div className="val">{stats.newOrders}</div></div>
      <div className="stat-card"><h3>Đơn hôm nay</h3><div className="val">{stats.todayOrders}</div></div>
      <div className="stat-card"><h3>Tổng đơn</h3><div className="val">{stats.totalOrders}</div></div>
      <div className="stat-card gold"><h3>Doanh thu (chưa huỷ)</h3><div className="val" style={{ fontSize: '1.45rem' }}>{fmt(stats.totalRevenue)}</div></div>
    </div>
  );
}

/* ── Order Detail Modal ── */
function OrderDetailModal({ orderId, onClose, onStatusChange }) {
  const [order, setOrder] = useState(null);
  const [updating, setU]  = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api.getAdminOrder(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  async function changeStatus(status) {
    setU(true);
    await api.updateOrderStatus(orderId, status).catch(() => {});
    setOrder(o => ({ ...o, status }));
    onStatusChange?.();
    setU(false);
  }

  if (!orderId) return null;
  const st = order && STATUS_MAP[order.status];

  return (
    <>
      <div className="overlay show" onClick={onClose} />
      <div className="modal open order-detail-modal" role="dialog" aria-label="Chi tiết đơn hàng">
        <button className="modal-close" onClick={onClose}>×</button>
        {!order ? <p>Đang tải…</p> : (
          <>
            <h3>Đơn hàng #{order.code}</h3>
            <div className="detail-row"><span>Khách hàng</span><strong>{order.customer_name}</strong></div>
            <div className="detail-row"><span>Điện thoại</span>{order.phone}</div>
            <div className="detail-row"><span>Địa chỉ</span>{order.address}</div>
            {order.note && <div className="detail-row"><span>Ghi chú</span>{order.note}</div>}
            <div className="detail-row"><span>Thanh toán</span>{order.payment_method === 'cod' ? '🛵 COD' : '🏦 Chuyển khoản'}</div>
            <div className="detail-row"><span>Ngày đặt</span>{new Date(order.created_at).toLocaleString('vi-VN')}</div>
            <div className="detail-row"><span>Trạng thái</span><span className={`status-badge ${st?.cls}`}>{st?.label}</span></div>

            <table className="items-table">
              <thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
              <tbody>
                {order.items.map(i => (
                  <tr key={i.id}><td>{i.product_name}</td><td>{i.quantity}</td><td>{fmt(i.price)}</td><td>{fmt(i.price * i.quantity)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td colSpan={3} style={{ fontWeight: 700, paddingTop: '.6rem' }}>Tổng cộng</td><td style={{ fontWeight: 700 }}>{fmt(order.total)}</td></tr></tfoot>
            </table>

            <p style={{ marginTop: '1.2rem', fontWeight: 600, fontSize: '.88rem' }}>Cập nhật trạng thái:</p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
              {statusOptions.map(s => (
                <button
                  key={s.v}
                  className={`chip${order.status === s.v ? ' active' : ''}`}
                  onClick={() => changeStatus(s.v)}
                  disabled={updating || order.status === s.v}
                  style={{ fontSize: '.82rem' }}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── Orders Tab ── */
function OrdersPanel() {
  const [data, setData]   = useState({ orders: [], total: 0 });
  const [status, setStatus] = useState('all');
  const [page, setPage]   = useState(1);
  const [selected, setSel]= useState(null);
  const LIMIT = 15;

  const load = useCallback(() => {
    api.getAdminOrders({ status, page, limit: LIMIT }).then(setData).catch(() => {});
  }, [status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status]);

  const pages = Math.ceil(data.total / LIMIT);

  return (
    <>
      <div className="admin-filters">
        <select className="admin-sel" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        <span style={{ fontSize: '.88rem', color: '#666', alignSelf: 'center' }}>{data.total} đơn</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th><th>Khách hàng</th><th>Điện thoại</th>
              <th>Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Không có đơn hàng</td></tr>
            ) : data.orders.map(o => {
              const st = STATUS_MAP[o.status];
              return (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSel(o.id)}>
                  <td><strong style={{ fontFamily: 'var(--font-m)' }}>{o.code}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{o.phone}</td>
                  <td>{fmt(o.total)}</td>
                  <td>{o.payment_method === 'cod' ? '🛵 COD' : '🏦 CK'}</td>
                  <td><span className={`status-badge ${st?.cls}`}>{st?.label}</span></td>
                  <td style={{ fontSize: '.82rem', color: '#666' }}>{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      <OrderDetailModal orderId={selected} onClose={() => setSel(null)} onStatusChange={load} />
    </>
  );
}

/* ── Edit Product Modal ── */
function EditProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({ ...product });
  const [loading, setL] = useState(false);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault(); setL(true);
    await api.updateProduct(product.id, {
      ...form, price: Number(form.price), old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock), active: form.active ? 1 : 0,
    }).catch(() => {});
    setL(false); onSaved(); onClose();
  }

  return (
    <>
      <div className="overlay show" onClick={onClose} />
      <div className="modal open edit-modal" role="dialog" aria-label="Sửa sản phẩm">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ marginBottom: '1rem' }}>Sửa: {product.name}</h3>
        <form onSubmit={save}>
          <div className="edit-grid">
            <label>Tên sản phẩm<input name="name" value={form.name} onChange={ch} required /></label>
            <label>Đơn vị<input name="unit" value={form.unit} onChange={ch} required /></label>
            <label>Giá (đồng)<input name="price" type="number" value={form.price} onChange={ch} required /></label>
            <label>Giá gốc (để trống nếu không có)<input name="old_price" type="number" value={form.old_price || ''} onChange={ch} /></label>
            <label>Tồn kho<input name="stock" type="number" value={form.stock} onChange={ch} required /></label>
            <label>Nhãn
              <select name="badge" value={form.badge || ''} onChange={ch}>
                <option value="">Không có</option>
                {Object.entries(BADGE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
          </div>
          <label style={{ marginTop: '.8rem', display: 'block' }}>Mô tả
            <textarea name="description" value={form.description || ''} onChange={ch} rows={3} style={{ width: '100%', padding: '.55rem', borderRadius: '8px', border: '1px solid #ddd', marginTop: '.3rem', resize: 'vertical' }} />
          </label>
          <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginTop: '.8rem', cursor: 'pointer' }}>
            <input type="checkbox" name="active" checked={!!form.active} onChange={ch} /> Đang bán (hiển thị trên trang)
          </label>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1.2rem', width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </>
  );
}

/* ── Products Tab ── */
function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing]   = useState(null);

  const load = () => api.getAdminProducts().then(setProducts).catch(() => {});
  useEffect(() => { load(); }, []);

  const catName = id => CATEGORIES.find(c => c.id === id)?.name || id;

  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Icon</th><th>Tên</th><th>Nhóm</th><th>Giá</th><th>Tồn kho</th><th>Nhãn</th><th>Trạng thái</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontSize: '1.5rem' }}>{p.icon}</td>
                <td><strong>{p.name}</strong><br /><span style={{ fontSize: '.78rem', color: '#888', fontFamily: 'monospace' }}>{p.unit}</span></td>
                <td>{catName(p.category)}</td>
                <td>
                  {fmt(p.price)}
                  {p.old_price && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '.82rem', marginLeft: '.4rem' }}>{fmt(p.old_price)}</span>}
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', color: p.stock < 10 ? 'var(--red)' : 'inherit' }}>{p.stock}</span>
                </td>
                <td>{p.badge && <span className={`status-badge ${BADGE_MAP[p.badge]?.cls}`}>{BADGE_MAP[p.badge]?.label}</span>}</td>
                <td>
                  {p.active
                    ? <span className="status-badge status-delivered">Đang bán</span>
                    : <span className="status-badge status-cancelled">Ẩn</span>}
                </td>
                <td>
                  <button className="chip" style={{ fontSize: '.82rem' }} onClick={() => setEditing(p)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditProductModal product={editing} onClose={() => setEditing(null)} onSaved={load} />
      )}
    </>
  );
}

/* ── Main AdminPage ── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('mocvi_token'));
  const [tab, setTab]       = useState('orders');

  function logout() {
    localStorage.removeItem('mocvi_token');
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <a href="/" className="logo">Mộc Vị <sub style={{ color: 'rgba(246,240,226,.6)', fontSize: '.6rem' }}>ADMIN</sub></a>
        <button onClick={logout} className="btn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff', padding: '.5rem 1rem' }}>
          Đăng xuất
        </button>
      </div>

      <div className="admin-nav">
        {[
          { id: 'stats',    l: '📊 Thống kê' },
          { id: 'orders',   l: '📋 Đơn hàng' },
          { id: 'products', l: '🛍️ Sản phẩm' },
        ].map(t => (
          <button key={t.id} className={`admin-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="admin-body">
        {tab === 'stats'    && <StatsPanel />}
        {tab === 'orders'   && <OrdersPanel />}
        {tab === 'products' && <ProductsPanel />}
      </div>
    </div>
  );
}
