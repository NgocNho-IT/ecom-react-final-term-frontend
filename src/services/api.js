import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// KẺ ĐÁNH CHẶN: Tự động đính kèm Token vào mọi request
API.interceptors.request.use((req) => {
    // Lấy thông tin user từ bộ nhớ trình duyệt
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        // Gắn Token vào Header Authorization
        req.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
    return req;
}, (error) => {
    return Promise.reject(error);
});

export default API;