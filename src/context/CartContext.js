import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await API.get('/cart');
            if (res.data.success && res.data.cart) {
                setCartCount(res.data.cart.items.length);
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
        }
    };

    // Tự động lấy số lượng khi đăng nhập
    useEffect(() => {
        fetchCartCount();
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};