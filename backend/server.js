require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const path    = require('path');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT       = process.env.PORT       || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mocvi-dev-secret';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'mocvi2024';
const FRONTEND   = process.env.FRONTEND_URL   || 'http://localhost:5173';

/* ─── Middleware ─────────────────────────────────────────── */
app.use(cors({ origin: FRONTEND }));
app.use(express.json());

/* ─── Database (file db.json, không cần cài đặt gì thêm) ── */
const db = low(new FileSync(path.join(__dirname, 'db.json')));
db.defaults({ products: [], orders: [], orderItems: [], _seq: { orderId: 1, itemId: 1 } }).write();

function nextId(field) {
  const id = db.get(`_seq.${field}`).value();
  db.set(`_seq.${field}`, id + 1).write();
  return id;
}

/* ─── Seed dữ liệu mẫu ──────────────────────────────────── */
if (db.get('products').size().value() === 0) {
  db.get('products').push(
    {id:'xoai-say',  name:'Xoài sấy dẻo',           category:'say',     price:45000, old_price:50000, unit:'Gói 200g',    badge:'bestseller', icon:'🥭', description:'Xoài cát chín tự nhiên, sấy dẻo ở nhiệt độ thấp, không thêm đường.',     stock:100, active:true},
    {id:'mit-say',   name:'Mít sấy giòn',             category:'say',     price:38000, old_price:null,  unit:'Gói 150g',    badge:null,         icon:'🍈', description:'Mít chín cây, sấy giòn tan bằng công nghệ chân không.',                 stock:100, active:true},
    {id:'chuoi-say', name:'Chuối sấy mật ong',        category:'say',     price:42000, old_price:null,  unit:'Gói 200g',    badge:'new',        icon:'🍌', description:'Chuối sứ sấy dẻo, áo một lớp mật ong rừng mỏng.',                     stock:100, active:true},
    {id:'omai-sau',  name:'Ô mai sấu gừng',           category:'say',     price:40000, old_price:48000, unit:'Hộp 180g',    badge:'sale',       icon:'🫒', description:'Sấu chín ngâm gừng theo công thức Hà Nội, vị chua dịu, cay nhẹ.',    stock:100, active:true},
    {id:'nuoc-mam',  name:'Nước mắm cá cơm nhỉ',     category:'giavi',   price:65000, old_price:null,  unit:'Chai 500ml',  badge:'bestseller', icon:'🐟', description:'Nước mắm nhỉ cá cơm Phú Quốc, độ đạm tự nhiên cao.',                 stock:100, active:true},
    {id:'tuong-ot',  name:'Tương ớt lên men',         category:'giavi',   price:35000, old_price:null,  unit:'Chai 250ml',  badge:null,         icon:'🌶️', description:'Ớt tươi lên men tự nhiên 30 ngày, vị cay nồng, chua nhẹ.',           stock:100, active:true},
    {id:'pho-bo',    name:'Phở bò ăn liền cao cấp',  category:'lien',    price:130000,old_price:145000,unit:'Combo 5 gói', badge:'bestseller', icon:'🍜', description:'Nước cốt xương bò ninh sẵn, bánh phở khô dai mềm.',                 stock:100, active:true},
    {id:'bun-rieu',  name:'Bún riêu ăn liền',         category:'lien',    price:135000,old_price:null,  unit:'Combo 5 gói', badge:'new',        icon:'🍲', description:'Vị riêu cua đồng chuẩn vị Bắc, kèm gói gạch cua sấy khô.',         stock:100, active:true},
    {id:'ca-phe',    name:'Cà phê robusta rang mộc',  category:'douong',  price:95000, old_price:null,  unit:'Túi 250g',    badge:'bestseller', icon:'☕', description:'Robusta Đắk Lắk rang mộc không tẩm phụ gia, hợp pha phin.',         stock:100, active:true},
    {id:'tra-atiso', name:'Trà atiso Đà Lạt',         category:'douong',  price:55000, old_price:null,  unit:'Hộp 100g',    badge:null,         icon:'🌿', description:'Hoa và lá atiso sấy khô nguyên chất từ Đà Lạt.',                   stock:100, active:true},
    {id:'keo-dua',   name:'Kẹo dừa Bến Tre',          category:'banhkeo', price:32000, old_price:null,  unit:'Gói 200g',    badge:null,         icon:'🥥', description:'Kẹo dừa nấu thủ công từ nước cốt dừa Bến Tre.',                   stock:100, active:true},
    {id:'banh-trang',name:'Bánh tráng nướng mè đen',  category:'banhkeo', price:25000, old_price:null,  unit:'Gói 5 cái',   badge:'new',        icon:'🫓', description:'Bánh tráng phơi sương, nướng giòn sẵn, rắc mè đen.',             stock:100, active:true}
  ).write();
  console.log('✓ Seeded 12 sản phẩm mẫu');
}

/* ─── Auth middleware ────────────────────────────────────── */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { req.admin = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token không hợp lệ' }); }
}

const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';

/* ══════════════════════════════════════════════════════════
   PUBLIC ROUTES
   ══════════════════════════════════════════════════════════ */

/* GET /api/products */
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let list = db.get('products').filter(p => p.active).value();
  if (category && category !== 'all') list = list.filter(p => p.category === category);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  res.json(list);
});

/* POST /api/orders */
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, address, note, payment_method, items } = req.body;
  if (!customer_name || !phone || !address || !items?.length)
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });

  let total = 0;
  const validated = [];
  for (const item of items) {
    const p = db.get('products').find({ id: item.product_id }).value();
    if (!p || !p.active) return res.status(400).json({ error: `Sản phẩm "${item.product_id}" không tồn tại` });
    if (p.stock < item.quantity) return res.status(400).json({ error: `"${p.name}" chỉ còn ${p.stock} sản phẩm` });
    total += p.price * item.quantity;
    validated.push({ product_id: p.id, product_name: p.name, price: p.price, quantity: item.quantity });
  }

  const orderId = nextId('orderId');
  const code = 'MV' + Date.now().toString().slice(-7);
  db.get('orders').push({
    id: orderId, code, customer_name, phone, address,
    note: note || '', payment_method: payment_method || 'cod',
    status: 'new', total, created_at: new Date().toISOString()
  }).write();

  validated.forEach(item => {
    db.get('orderItems').push({ id: nextId('itemId'), order_id: orderId, ...item }).write();
    const cur = db.get('products').find({ id: item.product_id }).value().stock;
    db.get('products').find({ id: item.product_id }).assign({ stock: cur - item.quantity }).write();
  });

  console.log(`✓ Đơn mới ${code} — ${fmt(total)} — ${payment_method}`);
  res.status(201).json({ code, id: orderId, total, message: 'Đặt hàng thành công' });
});

/* GET /api/orders/:code */
app.get('/api/orders/:code', (req, res) => {
  const order = db.get('orders').find({ code: req.params.code }).value();
  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  const items = db.get('orderItems').filter({ order_id: order.id }).value();
  res.json({ ...order, items });
});

/* ══════════════════════════════════════════════════════════
   ADMIN AUTH
   ══════════════════════════════════════════════════════════ */

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || password !== ADMIN_PASS)
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  res.json({ token: jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' }) });
});

/* ══════════════════════════════════════════════════════════
   ADMIN ROUTES
   ══════════════════════════════════════════════════════════ */

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const orders = db.get('orders').value();
  res.json({
    totalOrders:   orders.length,
    todayOrders:   orders.filter(o => o.created_at.slice(0, 10) === today).length,
    newOrders:     orders.filter(o => o.status === 'new').length,
    totalRevenue:  orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
    totalProducts: db.get('products').filter(p => p.active).size().value(),
  });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  let orders = db.get('orders').value();
  if (status && status !== 'all') orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = orders.length;
  const start = (Number(page) - 1) * Number(limit);
  res.json({ orders: orders.slice(start, start + Number(limit)), total, page: Number(page), limit: Number(limit) });
});

app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const order = db.get('orders').find({ id: Number(req.params.id) }).value();
  if (!order) return res.status(404).json({ error: 'Không tìm thấy' });
  res.json({ ...order, items: db.get('orderItems').filter({ order_id: order.id }).value() });
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const VALID = ['new', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  const { status } = req.body;
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  db.get('orders').find({ id: Number(req.params.id) }).assign({ status }).write();
  res.json({ success: true });
});

app.get('/api/admin/products', requireAdmin, (req, res) => {
  const products = db.get('products').value();
  products.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  res.json(products);
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { name, price, old_price, unit, description, badge, stock, active } = req.body;
  db.get('products').find({ id: req.params.id }).assign({
    name, price: Number(price), old_price: old_price ? Number(old_price) : null,
    unit, description, badge: badge || null, stock: Number(stock), active: !!active
  }).write();
  res.json({ success: true });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { id, name, category, price, old_price, unit, description, badge, icon, stock } = req.body;
  if (!id || !name || !category || !price) return res.status(400).json({ error: 'Thiếu trường bắt buộc' });
  if (db.get('products').find({ id }).value()) return res.status(400).json({ error: 'ID đã tồn tại' });
  db.get('products').push({
    id, name, category, price: Number(price), old_price: old_price ? Number(old_price) : null,
    unit, description: description || '', badge: badge || null, icon: icon || '📦',
    stock: Number(stock) || 100, active: true, created_at: new Date().toISOString()
  }).write();
  res.status(201).json({ success: true });
});


/* ─── Serve frontend (production) ──────────────────────── */
const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
  console.log('✓ Serving frontend from dist/');
}

/* ─── Start ─────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`✓ Mộc Vị API  →  http://localhost:${PORT}`);
  console.log(`  Admin:  ${ADMIN_USER} / ${ADMIN_PASS}`);
});
