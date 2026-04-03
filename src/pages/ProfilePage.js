import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        try {
            await API.put('/users/profile', { firstName, lastName, phone });
            alert("Đã cập nhật thông tin thành công!");
        } catch (error) {
            alert("Lỗi khi cập nhật!");
        }
    };

    return (
        <section className="profile-section" style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', padding: '50px 0' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-6">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                            <div className="text-center text-white" style={{ background: 'linear-gradient(135deg, #198754 0%, #145a32 100%)', borderRadius: '20px 20px 0 0', padding: '40px 20px' }}>
                                <i className="bi bi-person-bounding-box" style={{ fontSize: '4rem' }}></i>
                                <h2 className="fw-bold mb-0 text-uppercase">Hồ sơ của {user?.firstName}</h2>
                                <p className="small opacity-75 mb-0">Quản lý thông tin cá nhân tại NNIT Shop</p>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                <form onSubmit={handleUpdateInfo}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Email đăng nhập (Không thể đổi)</label>
                                        <input type="email" className="form-control" style={{ borderRadius: '10px' }} value={user?.email || ''} disabled />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Họ</label>
                                            <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Tên</label>
                                            <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-secondary">Số điện thoại</label>
                                        <input type="text" className="form-control" style={{ borderRadius: '10px' }} value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn text-white w-100 fw-bold shadow-sm" style={{ background: '#198754', borderRadius: '50px', padding: '12px' }}>
                                        <i className="bi bi-check2-circle me-2"></i> LƯU THAY ĐỔI
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;