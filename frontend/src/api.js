// Khi chạy local: VITE_API_URL=http://localhost:3001
// Khi deploy lên Railway (cùng server): để trống → dùng URL tương đối /api/...
const BASE = import.meta.env.VITE_API_URL || '';

async function req(path, options = {}) {
  const token = localStorage.getItem('mocvi_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  getProducts: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v)
    )).toString();
    return req(`/api/products${q ? '?' + q : ''}`);
  },
  createOrder: (body) => req('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrder:    (code) => req(`/api/orders/${code}`),
  adminLogin:  (creds) => req('/api/admin/login', { method: 'POST', body: JSON.stringify(creds) }),
  getAdminOrders: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v && v !== 'all')
    )).toString();
    return req(`/api/admin/orders${q ? '?' + q : ''}`);
  },
  getAdminOrder:    (id)         => req(`/api/admin/orders/${id}`),
  updateOrderStatus:(id, status) => req(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminProducts: ()           => req('/api/admin/products'),
  updateProduct:    (id, body)   => req(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  addProduct:       (body)       => req('/api/admin/products',       { method: 'POST', body: JSON.stringify(body) }),
  getStats:         ()           => req('/api/admin/stats'),
};

export const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';
export const STATUS_MAP = {
  new:       { label: 'Mới',         cls: 'status-new' },
  confirmed: { label: 'Đã xác nhận', cls: 'status-confirmed' },
  shipping:  { label: 'Đang giao',   cls: 'status-shipping' },
  delivered: { label: 'Đã giao',     cls: 'status-delivered' },
  cancelled: { label: 'Đã huỷ',      cls: 'status-cancelled' },
};
export const CATEGORIES = [
  { id: 'all',     name: 'Tất cả' },
  { id: 'say',     name: 'Trái cây sấy' },
  { id: 'giavi',   name: 'Gia vị & nước chấm' },
  { id: 'lien',    name: 'Đồ ăn liền' },
  { id: 'douong',  name: 'Cà phê & trà' },
  { id: 'banhkeo', name: 'Bánh kẹo & snack' },
];
export const BADGE_MAP = {
  bestseller: { label: 'Bán chạy', cls: 'badge--bestseller' },
  new:        { label: 'Mới',      cls: 'badge--new' },
  sale:       { label: 'Giảm giá', cls: 'badge--sale' },
};
