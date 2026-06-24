import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<ShopPage />} />
          <Route path="/admin"  element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
