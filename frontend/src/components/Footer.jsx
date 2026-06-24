export default function Footer() {
  return (
    <footer id="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a href="#top" className="logo">Mộc Vị</a>
          <p>Thực phẩm đóng gói từ nông sản Việt — sấy, ướp, đóng gói trong ngày, giao đến tận tay.</p>
        </div>
        <div>
          <h4>Mua sắm</h4>
          <ul>
            <li><a href="#catalog">Tất cả sản phẩm</a></li>
            <li><a href="#why">Quy trình sản xuất</a></li>
          </ul>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li>Hotline: 0909 123 456</li>
            <li>Email: hi@mocvi.vn</li>
            <li>8:00–20:00, cả tuần</li>
          </ul>
        </div>
        <div>
          <h4>Kết nối</h4>
          <ul>
            <li>Zalo OA: Mộc Vị Foods</li>
            <li>Facebook: /mocvi.foods</li>
            <li>Instagram: @mocvi.foods</li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Mộc Vị Foods. Mọi quyền được bảo lưu.</span>
        <span>COD · Chuyển khoản · Ví điện tử</span>
      </div>
    </footer>
  );
}
