import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import CategorySummaryPage from './pages/CategorySummaryPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AboutPage from './pages/AboutPage';

import AdminDashboardPage from './pages/AdminDashboardPage';
// MỚI THÊM: Import trang Review
import AdminReviewPage from './pages/AdminReviewPage'; 
import AddCategoryPage from './pages/AddCategoryPage';
import EditCategoryPage from './pages/EditCategoryPage'; 
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';   
import EditOrderPage from './pages/EditOrderPage';
import AdminUserEditPage from './pages/AdminUserEditPage';

// ===============================================
// MỚI THÊM: Import 5 trang hãng riêng biệt
// ===============================================
import ApplePage from './pages/ApplePage';
import SamsungPage from './pages/SamsungPage';
import XiaomiPage from './pages/XiaomiPage';
import OppoPage from './pages/OppoPage';
import VivoPage from './pages/VivoPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <main style={{ minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/update-password" element={<ChangePasswordPage />} /> 
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order/:id" element={<OrderDetailPage />} />
                <Route path="/categories" element={<CategorySummaryPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* =============================================== */}
                {/* MỚI THÊM: 5 Route cho 5 trang thương hiệu */}
                {/* =============================================== */}
                <Route path="/apple/:id" element={<ApplePage />} />
                <Route path="/samsung/:id" element={<SamsungPage />} />
                <Route path="/xiaomi/:id" element={<XiaomiPage />} />
                <Route path="/oppo/:id" element={<OppoPage />} />
                <Route path="/vivo/:id" element={<VivoPage />} />

                <Route path="/admin" element={<AdminDashboardPage />} />
                
                {/* MỚI THÊM DÒNG NÀY ĐỂ REACT MỞ ĐƯỢC TRANG ĐÁNH GIÁ */}
                <Route path="/admin/reviews" element={<AdminReviewPage />} />
                
                <Route path="/admin/category/add" element={<AddCategoryPage />} />
                <Route path="/admin/category/edit/:id" element={<EditCategoryPage />} />
  
                <Route path="/admin/product/add" element={<AddProductPage />} />
                <Route path="/admin/product/edit/:id" element={<EditProductPage />} />
                
                <Route path="/admin/order/edit/:id" element={<EditOrderPage />} />
                <Route path="/admin/user/edit/:id" element={<AdminUserEditPage />} />
              </Routes>
          </main>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;