import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Thêm ô xác nhận
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // HÀM KIỂM TRA VALIDATE FRONEND
    const validateForm = () => {
        if (password.length < 8) {
            return 'Mật khẩu phải chứa ít nhất 8 ký tự.';
        }
        if (/^\d+$/.test(password)) {
            return 'Mật khẩu không được chỉ chứa toàn chữ số.';
        }
        if (password !== confirmPassword) {
            return 'Nhập lại mật khẩu không khớp. Vui lòng kiểm tra lại.';
        }
        // Kiểm tra số điện thoại (Chỉ cho phép số, độ dài 9-11)
        if (!/^\d{9,11}$/.test(phone)) {
            return 'Số điện thoại không hợp lệ.';
        }
        return null; // Không có lỗi
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        // Kiểm tra Frontend trước khi gửi API
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return; 
        }

        try {
            const { data } = await API.post('/users/register', { firstName, lastName, phone, email, password });
            if (data.success) {
                login(data);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
        }
    };

    return (
        <div className="container py-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="text-center mb-4">
                        <i className="bi bi-person-plus-fill display-4 text-success mb-2"></i>
                        <h2 className="fw-bold text-success">ĐĂNG KÝ TÀI KHOẢN</h2>
                    </div>

                    <div className="card auth-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(25, 135, 84, 0.1)' }}>
                        <div className="card-body p-4 p-md-5">
                            {/* KHỐI HIỂN THỊ LỖI (Giống {{ field.errors }} của Django) */}
                            {error && (
                                <div className="alert alert-danger py-2 small fw-bold">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={submitHandler}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-dark small ms-1">Họ và đệm</label>
                                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={lastName} onChange={e => setLastName(e.target.value)} required />
                                    </div>
                                    <div className="col-md-6 mt-3 mt-md-0">
                                        <label className="form-label fw-bold text-dark small ms-1">Tên</label>
                                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Số điện thoại</label>
                                    <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Email</label>
                                    <input type="email" className="form-control" style={{ borderRadius: '10px' }} value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Mật khẩu</label>
                                    <input type="password" className="form-control" style={{ borderRadius: '10px' }} value={password} onChange={e => setPassword(e.target.value)} required />
                                    <ul className="form-text text-muted small mt-2" style={{ paddingLeft: '20px' }}>
                                        <li>Mật khẩu phải chứa ít nhất 8 ký tự.</li>
                                        <li>Mật khẩu không được chỉ chứa toàn chữ số.</li>
                                    </ul>
                                </div>

                                {/* Ô XÁC NHẬN MẬT KHẨU */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark small ms-1">Xác nhận mật khẩu</label>
                                    <input type="password" className="form-control" style={{ borderRadius: '10px' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #198754, #145a32)', border: 'none', padding: '12px', borderRadius: '50px', fontWeight: 'bold' }}>
                                        ĐĂNG KÝ NGAY <i className="bi bi-arrow-right-short"></i>
                                    </button>
                                </div>
                            </form>
                            <hr className="my-4 text-muted" />
                            <div className="text-center">
                                <p className="small mb-0">Bạn đã có tài khoản rồi?</p>
                                <Link to="/login" style={{ color: '#198754', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập tại đây</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;