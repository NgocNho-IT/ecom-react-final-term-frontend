import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); // TÍNH NĂNG MỚI: State giữ chân hệ thống

    useEffect(() => {
        // Kiểm tra xem trong kho chứa cục bộ có thông tin đăng nhập cũ không
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
  
            API.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        
        // Dù có hay không có user, cũng báo là "Đã kiểm tra xong!"
        setLoadingAuth(false); 
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        API.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete API.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {/* NẾU ĐANG KIỂM TRA THÌ HIỆN SPINNER, XONG RỒI MỚI CHO HIỆN CÁC TRANG (CHILDREN) */}
            {loadingAuth ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};