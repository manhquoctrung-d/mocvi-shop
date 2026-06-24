# Mộc Vị Shop — Hệ thống bán hàng thực phẩm đóng gói

## Công nghệ sử dụng
- **Frontend:** React 18 + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (tích hợp sẵn, không cần cài thêm)

---

## Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9

---

## Cài đặt và khởi động

### 1. Backend API

```bash
cd backend
npm install
node server.js
# Server chạy tại http://localhost:3001
```

Cấu hình qua biến môi trường (tạo file `.env` từ `.env.example`):
```
PORT=3001
JWT_SECRET=thay-bang-chuoi-ngau-nhien-dai
ADMIN_USERNAME=admin
ADMIN_PASSWORD=matkhau-cua-ban
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend React

```bash
cd frontend
npm install
npm run dev
# Ứng dụng chạy tại http://localhost:5173
```

Cấu hình qua `.env` (tạo từ `.env.example`):
```
VITE_API_URL=http://localhost:3001
```

---

## Trang quản trị Admin

Truy cập: `http://localhost:5173/admin`

Thông tin đăng nhập mặc định:
- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `mocvi2024`

> ⚠️ **Quan trọng:** Đổi mật khẩu trước khi deploy lên môi trường thật qua biến môi trường `ADMIN_PASSWORD`.

---

## Deploy lên môi trường thật

### Build frontend
```bash
cd frontend
npm run build
# File tĩnh xuất ra thư mục dist/
```

### Phương án deploy đơn giản
- **Backend:** Render.com, Railway.app, hoặc VPS bất kỳ
- **Frontend (dist/):** Vercel, Netlify, hoặc để Express serve luôn

### Nối cổng thanh toán thật
Mã nguồn đã có chỗ tích hợp:
- **VNPay / Momo / ZaloPay:** Thêm SDK vào backend `/backend/server.js`, kết nối vào route `POST /api/orders` sau khi tạo đơn hàng thành công.
- Hiện tại hỗ trợ: COD (giao hàng thu tiền) và Chuyển khoản ngân hàng.

---

## Cấu trúc thư mục

```
mocvi-shop/
├── backend/
│   ├── server.js      # Toàn bộ Express API + SQLite
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── CartContext.jsx   # Giỏ hàng (lưu localStorage)
    │   ├── api.js            # Tất cả lời gọi API
    │   ├── index.css
    │   ├── pages/
    │   │   ├── ShopPage.jsx  # Trang chính
    │   │   └── AdminPage.jsx # Quản trị
    │   └── components/
    │       ├── Header.jsx
    │       ├── CartDrawer.jsx
    │       ├── QuickView.jsx
    │       ├── CheckoutModal.jsx
    │       └── Footer.jsx
    ├── package.json
    └── vite.config.js
```
