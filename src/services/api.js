import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        req.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
    return req;
}, (error) => {
    return Promise.reject(error);
});

export default API;