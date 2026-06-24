import { useState, useEffect, useCallback, useRef } from 'react';
import { api, CATEGORIES, BADGE_MAP, fmt } from '../api';
import { useCart } from '../CartContext';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import QuickView from '../components/QuickView';
import CheckoutModal from '../components/CheckoutModal';
import Footer from '../components/Footer';

/* ─── Toast hook ─── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, visible: false }]);
    setTimeout(() => setToasts(t => t.map(x => x.id === id ? { ...x, visible: true } : x)), 30);
    setTimeout(() => setToasts(t => t.map(x => x.id === id ? { ...x, visible: false } : x)), 2600);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2900);
  }, []);
  return { toasts, show };
}

/* ─── Product Card ─── */
function ProductCard({ product, onAdd, onQuickView }) {
  const badge = product.badge && BADGE_MAP[product.badge];
  return (
    <article className="product-card">
      {badge && <span className={`badge ${badge.cls}`}>{badge.label}</span>}
      <div className="card-media" onClick={() => onQuickView(product)}>
        <span aria-hidden="true">{product.icon}</span>
        <div className="card-media-overlay" aria-hidden="true">Xem nhanh</div>
      </div>
      <h3 className="card-name">{product.name}</h3>
      <p className="card-unit">{product.unit}</p>
      <div className="card-foot">
        <span className="price-tag">
          {product.old_price && <span className="old-price">{fmt(product.old_price)}</span>}
          {fmt(product.price)}
        </span>
        <button className="add-btn" onClick={() => onAdd(product)} aria-label={`Thêm ${product.name} vào giỏ`}>+</button>
      </div>
    </article>
  );
}

/* ─── Floating chips in hero ─── */
const CHIPS = [
  { label: 'Xoài sấy dẻo',      icon: '🥭', style: { top: '4%',  left: '6%',  '--r': '-6deg', animationDelay: '0s' } },
  { label: 'Cà phê rang mộc',   icon: '☕', style: { top: '30%', left: '46%', '--r': '4deg',  animationDelay: '1.1s' } },
  { label: 'Tương ớt lên men',  icon: '🌶️', style: { top: '62%', left: '2%',  '--r': '3deg',  animationDelay: '2s' } },
  { label: 'Phở ăn liền',       icon: '🍜', style: { top: '6%',  left: '68%', '--r': '7deg',  animationDelay: '.6s' } },
  { label: 'Kẹo dừa',           icon: '🥥', style: { top: '70%', left: '55%', '--r': '-4deg', animationDelay: '1.7s' } },
];

export default function ShopPage() {
  const { dispatch } = useCart();
  const { toasts, show: toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch]     = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [qvProduct, setQvProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [nlDone, setNlDone] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getProducts({ category: category !== 'all' ? category : '', search })
      .then(data => { if (active) { setProducts(data); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, search]);

  const handleSearch = (val) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(val), 220);
  };

  const addToCart = (product) => {
    dispatch({ type: 'ADD', product, qty: 1 });
    toast(`Đã thêm "${product.name}" vào giỏ`);
  };

  return (
    <>
      <a href="#main" className="sr-only">Bỏ qua, đến nội dung</a>
      <Header onCartOpen={() => setCartOpen(true)} onSearch={handleSearch} />

      <main id="main">
        {/* ── Hero ── */}
        <section className="hero" id="top">
          <div className="wrap hero-inner">
            <div>
              <p className="eyebrow">Nông sản Việt — đóng gói chuẩn, gửi đi xa</p>
              <h1>Hương vị quê nhà, <em>đóng gói</em> cẩn thận, gửi đến tận tay bạn.</h1>
              <p className="hero-lede">Mộc Vị chọn nguyên liệu từ những vùng trồng quen mặt, sấy và đóng gói trong ngày để giữ vị thật — không cần chất bảo quản.</p>
              <div className="hero-cta">
                <a href="#catalog" className="btn btn-primary">Xem sản phẩm</a>
                <a href="#story" className="btn btn-ghost">Câu chuyện Mộc Vị</a>
              </div>
              <ul className="trust-strip">
                <li>Đóng gói trong vòng 24 giờ kể từ khi đặt</li>
                <li>Nguyên liệu từ 12 vùng trồng tại Việt Nam</li>
                <li>Giao toàn quốc, kiểm hàng trước khi nhận</li>
              </ul>
            </div>
            <div className="hero-visual" aria-hidden="true">
              {CHIPS.map(c => (
                <div key={c.label} className="float-chip" style={c.style}>
                  <span className="ic">{c.icon}</span> {c.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Story ── */}
        <section className="story" id="story">
          <div className="wrap story-inner">
            <h2>"Bắt đầu từ gian hàng nhỏ ở chợ quê."</h2>
            <p>Mộc Vị bắt đầu từ căn bếp nhỏ, nơi cả nhà cùng sấy xoài và làm mắm theo công thức của bà ngoại. Khi đơn hàng vượt ra khỏi làng, chúng tôi giữ nguyên cách làm cũ — chỉ thêm quy trình đóng gói hút chân không đạt chuẩn, để món quà quê đi xa mà vẫn giữ được vị thật như lúc mới ra lò.</p>
          </div>
        </section>

        {/* ── Catalog ── */}
        <section className="catalog wrap" id="catalog">
          <div className="section-head">
            <div>
              <p className="eyebrow">Toàn bộ sản phẩm</p>
              <h2 style={{ fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', marginTop: '.3rem' }}>Chọn món bạn muốn mang theo</h2>
            </div>
          </div>

          <div className="filters" role="group" aria-label="Lọc theo nhóm">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`chip${category === c.id ? ' active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {loading ? (
              <div className="empty-state">Đang tải…</div>
            ) : products.length === 0 ? (
              <div className="empty-state">Không tìm thấy sản phẩm. Thử từ khóa khác hoặc chọn "Tất cả".</div>
            ) : (
              products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={addToCart}
                  onQuickView={setQvProduct}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Why ── */}
        <section className="why wrap" id="why">
          <p className="eyebrow">Quy trình</p>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', marginTop: '.4rem' }}>Vì sao Mộc Vị giữ được vị thật</h2>
          <div className="why-grid">
            {[
              { i:'🌾', h:'Chọn nguyên liệu tại vườn', p:'Mỗi loại trái cây, gia vị thu mua trực tiếp từ vùng trồng quen, ghi rõ nguồn gốc từng lô.' },
              { i:'🔥', h:'Sấy và đóng gói trong ngày', p:'Sấy ở nhiệt độ thấp ngay sau thu hoạch, hạn chế tối đa việc dùng chất bảo quản.' },
              { i:'📦', h:'Hút chân không, bảo quản lâu', p:'Bao bì kín khí giúp bảo quản 6–12 tháng ở nhiệt độ thường, không cần trữ lạnh.' },
            ].map(w => (
              <div className="why-card" key={w.h}>
                <div className="wi">{w.i}</div>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="testi wrap">
          <p className="eyebrow">Khách hàng nói gì</p>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.6vw,2.2rem)', marginTop: '.4rem' }}>Vị thật, người ăn biết ngay</h2>
          <div className="testi-grid">
            {[
              { q:'"Xoài sấy dẻo, ngọt tự nhiên, không bị gắt như loại hay mua siêu thị."', who:'Thu Hà — Hà Nội' },
              { q:'"Đặt buổi sáng chiều đã giao, đóng gói chắc, hàng không vỡ vụn gì."', who:'Minh Tuấn — TP. HCM' },
              { q:'"Nước mắm thơm mùi cá cơm thật, cả nhà chuyển sang dùng hẳn của Mộc Vị."', who:'Cô Lan — Đà Nẵng' },
            ].map(t => (
              <div className="testi-card" key={t.who}>
                <blockquote>{t.q}</blockquote>
                <cite>{t.who}</cite>
              </div>
            ))}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="newsletter">
          <div className="wrap newsletter-inner">
            <h2>Nhận ưu đãi mỗi tuần qua Zalo — không spam, không quảng cáo lan man.</h2>
            {nlDone ? (
              <p style={{ color: '#fff', fontWeight: 600 }}>✓ Đã ghi nhận, Mộc Vị sẽ liên hệ sớm!</p>
            ) : (
              <form className="nl-form" onSubmit={e => { e.preventDefault(); setNlDone(true); }}>
                <input type="tel" placeholder="Số điện thoại của bạn" required aria-label="Số điện thoại" />
                <button type="submit">Đăng ký</button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Overlays ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => setCheckoutOpen(true)}
      />

      {qvProduct && (
        <QuickView
          product={qvProduct}
          onClose={() => setQvProduct(null)}
          onAddedToCart={() => toast(`Đã thêm "${qvProduct.name}" vào giỏ`)}
        />
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      {/* ── Toasts ── */}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast${t.visible ? ' show' : ''}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}
