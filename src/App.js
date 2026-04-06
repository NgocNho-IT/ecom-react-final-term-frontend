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
import AddCategoryPage from './pages/AddCategoryPage';
import EditCategoryPage from './pages/EditCategoryPage'; 
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';   
import EditOrderPage from './pages/EditOrderPage';

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

                <Route path="/admin" element={<AdminDashboardPage />} />
                
                <Route path="/admin/category/add" element={<AddCategoryPage />} />
                <Route path="/admin/category/edit/:id" element={<EditCategoryPage />} />
  
                <Route path="/admin/product/add" element={<AddProductPage />} />
                <Route path="/admin/product/edit/:id" element={<EditProductPage />} />
                
                <Route path="/admin/order/edit/:id" element={<EditOrderPage />} />
              </Routes>
          </main>
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;