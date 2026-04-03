import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Kiểm tra xem trình duyệt có lưu token cũ không mỗi khi mở web
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            // Gắn sẵn Token vào mọi request Axios tiếp theo
            API.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
    }, []);

    // Hàm gọi khi đăng nhập thành công
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        API.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    // Hàm gọi khi đăng xuất
    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete API.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};