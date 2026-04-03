import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const ChangePasswordPage = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const navigate = useNavigate();

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword.length < 8) {
            return setError('Mật khẩu mới phải chứa ít nhất 8 ký tự.');
        }
        if (/^\d+$/.test(newPassword)) {
            return setError('Mật khẩu mới không được chỉ chứa toàn chữ số.');
        }
        if (newPassword !== confirmPassword) {
            return setError('Xác nhận mật khẩu không khớp!');
        }

        try {
            const { data } = await API.put('/users/update-password', { oldPassword, newPassword });
            if (data.success) {
                setSuccessMsg('Đổi mật khẩu thành công!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => navigate('/profile'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi khi đổi mật khẩu!");
        }
    };

    return (
        <>
            <style>
                {`
                    .password-section {
                        background-color: #f8f9fa;
                        min-height: 85vh;
                        display: flex;
                        align-items: center;
                        padding: 50px 0;
                    }
                    .password-card {
                        border: none;
                        border-radius: 20px;
                        box-shadow: 0 15px 35px rgba(25, 135, 84, 0.1) !important;
                    }
                    .password-header {
                        background: linear-gradient(135deg, #198754 0%, #145a32 100%);
                        color: white;
                        border-radius: 20px 20px 0 0;
                        padding: 35px 20px;
                    }
                    .password-card label {
                        font-weight: 600;
                        font-size: 0.85rem;
                        color: #495057;
                        margin-bottom: 8px;
                        display: block;
                    }
                    .password-card input {
                        border-radius: 12px;
                        padding: 12px 15px;
                        border: 1px solid #dee2e6;
                        width: 100%;
                        transition: 0.3s;
                    }
                    .password-card input:focus {
                        border-color: #198754;
                        box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.15);
                        outline: none;
                    }
                    .password-card .helptext {
                        display: block;
                        font-size: 0.75rem;
                        color: #6c757d;
                        margin-top: 5px;
                        line-height: 1.4;
                        background: #f1f8f4;
                        padding: 10px;
                        border-radius: 8px;
                        border-left: 3px solid #198754;
                    }
                    .btn-save-pw {
                        background-color: #198754;
                        border: none;
                        padding: 14px;
                        border-radius: 50px;
                        font-weight: bold;
                        letter-spacing: 0.5px;
                        transition: 0.3s;
                    }
                    .btn-save-pw:hover {
                        background-color: #145a32;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
                    }
                `}
            </style>

            <section className="password-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="card password-card">
                                <div className="password-header text-center">
                                    <div className="mb-3">
                                        <i className="bi bi-shield-lock-fill" style={{ fontSize: '3.5rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold mb-0 text-uppercase">Đổi Mật Khẩu</h3>
                                    <p className="small opacity-75 mb-0 mt-2">Đảm bảo an toàn cho tài khoản NNIT của Nhớ</p>
                                </div>

                                <div className="card-body p-4 p-md-5 bg-white rounded-bottom-4">
                                    {error && <div className="alert alert-danger py-2 small fw-bold">{error}</div>}
                                    {successMsg && <div className="alert alert-success py-2 small fw-bold">{successMsg}</div>}

                                    <form onSubmit={handleUpdatePassword}>
                                        <div className="mb-3">
                                            <label>Mật khẩu hiện tại</label>
                                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                                        </div>
                                        <div className="mb-3">
                                            <label>Mật khẩu mới</label>
                                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                            <span className="helptext">
                                                <ul className="mb-0 ps-3">
                                                    <li>Mật khẩu không được quá giống với thông tin cá nhân khác.</li>
                                                    <li>Mật khẩu phải chứa ít nhất 8 ký tự.</li>
                                                    <li>Mật khẩu không được là mật khẩu phổ biến thường dùng.</li>
                                                    <li>Mật khẩu không được chỉ chứa toàn chữ số.</li>
                                                </ul>
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <label>Xác nhận mật khẩu mới</label>
                                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                            <span className="helptext text-muted small">Vui lòng nhập lại mật khẩu y hệt như trên để xác thực.</span>
                                        </div>

                                        <div className="d-grid gap-2 mt-4">
                                            <button type="submit" className="btn btn-save-pw text-white shadow-sm">
                                                XÁC NHẬN ĐỔI MẬT KHẨU
                                            </button>
                                            <Link to="/profile" className="btn btn-light rounded-pill fw-bold mt-2">
                                                Hủy bỏ
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="text-center mt-4 text-muted small">
                                <p><i className="bi bi-info-circle"></i> Bạn nên đặt mật khẩu mạnh bao gồm cả chữ và số.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ChangePasswordPage;