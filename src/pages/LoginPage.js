import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await API.post('/users/login', { email, password });
            if (data.success) {
                login(data); // Lưu vào Context
                navigate('/'); // Chuyển về trang chủ
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
        }
    };

    return (
        <section className="login-section" style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-5">
                        <div className="card login-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 35px rgba(25, 135, 84, 0.1)', overflow: 'hidden' }}>
                            <div className="login-header text-center" style={{ background: 'linear-gradient(135deg, #198754 0%, #145a32 100%)', padding: '40px 20px', color: 'white' }}>
                                <i className="bi bi-person-circle display-4 mb-3 d-inline-block"></i>
                                <h3 className="fw-bold mb-0">ĐĂNG NHẬP</h3>
                                <p className="small mb-0 opacity-75">Chào mừng bạn trở lại với NNIT Shop</p>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {error && <div className="alert alert-danger small"><i className="bi bi-exclamation-circle"></i> {error}</div>}
                                
                                <form onSubmit={submitHandler}>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">Email đăng nhập</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-success"><i className="bi bi-envelope-fill"></i></span>
                                            <input 
                                                type="email" 
                                                className="form-control border-start-0" 
                                                style={{ borderRadius: '0 12px 12px 0', padding: '12px 18px', borderColor: '#dee2e6' }}
                                                placeholder="Ví dụ: nho@gmail.com" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">Mật khẩu</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0 text-success"><i className="bi bi-lock-fill"></i></span>
                                            <input 
                                                type="password" 
                                                className="form-control border-start-0" 
                                                style={{ borderRadius: '0 12px 12px 0', padding: '12px 18px', borderColor: '#dee2e6' }}
                                                placeholder="Nhập mật khẩu..." 
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #198754, #145a32)', padding: '12px', borderRadius: '50px', fontWeight: 'bold' }}>
                                            Đăng nhập ngay
                                        </button>
                                    </div>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="small text-muted mb-1">Chưa có tài khoản?</p>
                                    <Link to="/register" className="small" style={{ color: '#198754', fontWeight: 'bold' }}>Tạo tài khoản mới tại đây</Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center mt-4">
                            <Link to="/" className="text-secondary text-decoration-none small">
                                <i className="bi bi-arrow-left"></i> Quay lại trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;