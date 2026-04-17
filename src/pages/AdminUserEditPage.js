import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

// BẢNG DANH SÁCH CÁC QUYỀN MODULE TRONG HỆ THỐNG
const MODULE_PERMISSIONS = [
    { id: 'DASHBOARD', name: 'Xem Tổng quan (Thống kê)', icon: 'bi-graph-up' },
    { id: 'USERS', name: 'Quản lý Tài khoản', icon: 'bi-people' },
    { id: 'ORDERS', name: 'Quản lý Đơn hàng', icon: 'bi-cart3' },
    { id: 'PRODUCTS', name: 'Quản lý Sản phẩm', icon: 'bi-box-seam' },
    { id: 'CATEGORIES', name: 'Quản lý Danh mục', icon: 'bi-tags' },
    { id: 'REVIEWS', name: 'Kiểm duyệt Đánh giá', icon: 'bi-chat-left-dots' }
];

const AdminUserEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: ''
    });
    
    const [newPassword, setNewPassword] = useState('');
    
    // State lưu mảng quyền của user đang được edit
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await API.get(`/admin/user/${id}`);
                if (data.success) {
                    setTargetUser(data.user);
                    setFormData({
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        email: data.user.email,
                        phone: data.user.phone
                    });
                    // Lấy mảng quyền từ database lên
                    setSelectedPermissions(data.user.permissions || []);
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi lấy thông tin user:", error);
                alert("Không thể tải dữ liệu người dùng!");
                navigate('/admin');
            }
        };
        fetchUser();
    }, [id, navigate]);

    // ==========================================
    // XỬ LÝ CÁC HÀNH ĐỘNG CỦA ADMIN
    // ==========================================
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý khi bật/tắt nút quyền
    const handleTogglePermission = (moduleId) => {
        if (selectedPermissions.includes(moduleId)) {
            setSelectedPermissions(selectedPermissions.filter(p => p !== moduleId));
        } else {
            setSelectedPermissions([...selectedPermissions, moduleId]);
        }
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        try {
            // Gộp cả formData và permissions để gửi lên Backend
            const payload = { ...formData, permissions: selectedPermissions };
            const { data } = await API.put(`/admin/user/${id}`, payload);
            if (data.success) {
                alert("Cập nhật thông tin & Quyền hạn thành công!");
                setTargetUser(data.user);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật!");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 5) {
            alert("Vui lòng nhập mật khẩu mới có ít nhất 5 ký tự!");
            return;
        }
        if (window.confirm(`Xác nhận đổi mật khẩu cho tài khoản ${targetUser.email}?`)) {
            try {
                const { data } = await API.put(`/admin/user/${id}`, { password: newPassword });
                if (data.success) {
                    alert("Cấp lại mật khẩu thành công!");
                    setNewPassword(''); // Xóa rỗng ô input sau khi đổi xong
                }
            } catch (error) {
                alert(error.response?.data?.message || "Lỗi khi đổi mật khẩu!");
            }
        }
    };

    const handleToggleBlock = async () => {
        try {
            const { data } = await API.put(`/admin/user/${id}/block`);
            if (data.success) {
                alert(data.message);
                setTargetUser({ ...targetUser, isBlocked: !targetUser.isBlocked });
            }
        } catch (error) { alert(error.response?.data?.message || "Lỗi thao tác!"); }
    };

    const handleToggleRole = async () => {
        const action = targetUser.isAdmin ? "Gỡ quyền Admin" : "Cấp quyền Admin";
        if (window.confirm(`Xác nhận ${action} cho tài khoản này?`)) {
            try {
                const { data } = await API.put(`/admin/user/${id}/role`);
                if (data.success) {
                    alert(data.message);
                    setTargetUser({ ...targetUser, isAdmin: !targetUser.isAdmin });
                }
            } catch (error) { alert(error.response?.data?.message || "Lỗi thao tác!"); }
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Cảnh báo: Hành động này sẽ xóa vĩnh viễn tài khoản. Tiếp tục?")) {
            try {
                const { data } = await API.delete(`/admin/user/${id}`);
                if (data.success) {
                    alert("Đã xóa tài khoản thành công!");
                    navigate('/admin');
                }
            } catch (error) { alert(error.response?.data?.message || "Lỗi thao tác!"); }
        }
    };

    // ==========================================
    // CSS FULLSCREEN (Che Navbar/Footer)
    // ==========================================
    const fullScreenStyle = {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#f4f6f9', zIndex: 9999, display: 'flex',
        flexDirection: 'column', overflowY: 'auto'
    };

    if (loading || !targetUser) return (
        <div style={{...fullScreenStyle, justifyContent: 'center', alignItems: 'center'}}>
            <div className="spinner-border text-success mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
            <h4 className="text-success fw-bold">Đang tải hồ sơ khách hàng...</h4>
        </div>
    );

    // ====================================================
    // LOGIC PHÂN QUYỀN HIỂN THỊ (UI ROLE-BASED ACCESS)
    // ====================================================
    const isSelf = currentUser && currentUser._id === targetUser._id;
    const isCurrentUserSuperAdmin = currentUser?.isSuperAdmin;
    const isTargetAdminOrSuper = targetUser.isAdmin || targetUser.isSuperAdmin;

    // 1. Quyền cấp/gỡ Admin: Chỉ Super Admin
    const canEditRole = isCurrentUserSuperAdmin && !isSelf && !targetUser.isSuperAdmin; 
    
    // 2. Quyền Khóa (Block): SuperAdmin khóa mọi người (trừ SuperAdmin), Sub-Admin khóa được Khách
    const canBlock = isCurrentUserSuperAdmin 
        ? (!isSelf && !targetUser.isSuperAdmin) 
        : (!isTargetAdminOrSuper && !isSelf);

    // 3. Quyền XÓA (Delete): ĐỘC QUYỀN CỦA SUPER ADMIN
    const canDelete = isCurrentUserSuperAdmin && !isSelf && !targetUser.isSuperAdmin;

    // 4. Quyền Sửa thông tin: SuperAdmin sửa mọi người, Sub-Admin sửa Khách
    const canEditInfo = isCurrentUserSuperAdmin || isSelf || !isTargetAdminOrSuper;

    return (
        <div style={fullScreenStyle}>
            <style>
                {`
                    .admin-topbar {
                        background-color: #ffffff;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        padding: 15px 30px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        position: sticky;
                        top: 0;
                        z-index: 1000;
                    }
                    .admin-content {
                        padding: 40px 20px;
                        flex-grow: 1;
                        max-width: 1100px;
                        margin: 0 auto;
                        width: 100%;
                    }
                    .custom-input {
                        border: 1px solid #dee2e6;
                        padding: 12px 15px;
                        background-color: #f8f9fa;
                        font-weight: 500;
                        color: #495057;
                        transition: all 0.3s ease;
                    }
                    .custom-input:focus {
                        border-color: #198754;
                        background-color: #ffffff;
                        box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.15);
                        outline: none;
                    }
                    .custom-input:disabled {
                        background-color: #e9ecef;
                        cursor: not-allowed;
                    }
                    .btn-action-outline {
                        border-width: 2px;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }
                    .btn-action-outline:hover:not(:disabled) {
                        transform: translateY(-2px);
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #f1f3f5;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                        padding-bottom: 0;
                    }
                    .badge-status {
                        font-size: 13px;
                        padding: 8px 16px;
                        font-weight: 600;
                    }
                    .perm-card { 
                        border: 1px solid #e0e0e0; 
                        border-radius: 12px; 
                        transition: all 0.2s; 
                    }
                    .perm-card.active { 
                        border-color: #198754; 
                        background-color: #f8fffb; 
                        box-shadow: 0 4px 6px rgba(25,135,84,0.05);
                    }
                `}
            </style>

            {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
            <div className="admin-topbar">
                <div className="d-flex align-items-center">
                    <Link to="/admin" className="text-decoration-none">
                        <h4 className="fw-bolder text-success mb-0 me-3 pe-3 border-end">NNIT ADMIN</h4>
                    </Link>
                    <h5 className="text-secondary mb-0 fw-bold">Chi tiết Tài khoản</h5>
                </div>
                <Link to="/admin" className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm">
                    <i className="bi bi-arrow-left me-2"></i>Quay lại
                </Link>
            </div>

            {/* KHU VỰC NỘI DUNG */}
            <div className="admin-content">
                
                {/* Tiêu đề trang */}
                <div className="d-flex align-items-center mb-4 pb-2">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '55px', height: '55px', fontSize: '24px', fontWeight: 'bold' }}>
                        {targetUser.lastName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="fw-bold text-dark mb-1">{targetUser.lastName} {targetUser.firstName}</h3>
                        <p className="text-muted mb-0"><i className="bi bi-envelope-fill me-2"></i>{targetUser.email}</p>
                    </div>
                </div>

                <div className="row g-4">
                    {/* ========================================= */}
                    {/* CỘT TRÁI: FORM CHỈNH SỬA THÔNG TIN */}
                    {/* ========================================= */}
                    <div className="col-lg-8">
                        <form onSubmit={handleSaveInfo}>
                            {/* BLOCK 1: THÔNG TIN CÁ NHÂN */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
                                <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-person-lines-fill me-2 text-success"></i>Cập nhật thông tin cá nhân</h5>
                                
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-bold small text-uppercase">Họ khách hàng</label>
                                        <input type="text" className="form-control rounded-3 custom-input" name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={!canEditInfo} />
                                    </div>
                                    <div className="col-md-6 mt-3 mt-md-0">
                                        <label className="form-label text-muted fw-bold small text-uppercase">Tên khách hàng</label>
                                        <input type="text" className="form-control rounded-3 custom-input" name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={!canEditInfo} />
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label text-muted fw-bold small text-uppercase">Địa chỉ Email</label>
                                    <input type="email" className="form-control rounded-3 custom-input" name="email" value={formData.email} onChange={handleInputChange} required disabled={!canEditInfo} />
                                </div>
                                
                                <div>
                                    <label className="form-label text-muted fw-bold small text-uppercase">Số điện thoại liên hệ</label>
                                    <input type="text" className="form-control rounded-3 custom-input" name="phone" value={formData.phone} onChange={handleInputChange} required disabled={!canEditInfo} />
                                </div>
                            </div>

                            {/* BLOCK 2: PHÂN QUYỀN MODULE (CHỈ HIỆN CHO ADMIN THƯỜNG) */}
                            {targetUser.isAdmin && !targetUser.isSuperAdmin && (
                                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="fw-bold text-dark mb-0"><i className="bi bi-ui-checks-grid me-2 text-primary"></i>Phân quyền Module (Dành cho Admin)</h5>
                                    </div>
                                    <p className="text-muted small mb-4">Lựa chọn các chức năng mà nhân viên này được phép truy cập và quản lý.</p>
                                    
                                    <div className="row g-3">
                                        {MODULE_PERMISSIONS.map(mod => {
                                            const isActive = selectedPermissions.includes(mod.id);
                                            return (
                                                <div className="col-md-6" key={mod.id}>
                                                    <div className={`perm-card p-3 d-flex align-items-center justify-content-between ${isActive ? 'active' : ''}`}>
                                                        <div className="d-flex align-items-center">
                                                            <i className={`bi ${mod.icon} fs-4 me-3 ${isActive ? 'text-success' : 'text-muted'}`}></i>
                                                            <span className={`fw-bold ${isActive ? 'text-success' : 'text-secondary'}`}>{mod.name}</span>
                                                        </div>
                                                        <div className="form-check form-switch m-0">
                                                            <input 
                                                                className="form-check-input cursor-pointer" 
                                                                type="checkbox" 
                                                                role="switch" 
                                                                style={{ transform: 'scale(1.3)' }}
                                                                checked={isActive}
                                                                onChange={() => handleTogglePermission(mod.id)}
                                                                disabled={!isCurrentUserSuperAdmin} // Chỉ Super Admin được phép gạt nút
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {!isCurrentUserSuperAdmin && (
                                        <div className="mt-3 text-danger small fw-bold">
                                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                            Chỉ Quản trị viên Tối cao (Super Admin) mới có quyền thay đổi các thông số này.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* NÚT LƯU CHO CẢ THÔNG TIN VÀ PHÂN QUYỀN */}
                            <div className="text-end mb-5">
                                <button type="submit" className="btn btn-success btn-lg px-5 rounded-pill fw-bold shadow-sm" disabled={!canEditInfo}>
                                    <i className="bi bi-check-circle-fill me-2"></i>Lưu Thay Đổi
                                </button>
                            </div>
                        </form>

                        {/* CARD ĐỔI MẬT KHẨU TÁCH BIỆT */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-key-fill me-2 text-warning"></i>Cấp lại mật khẩu mới</h5>
                            <p className="text-muted small mb-4">Nhập mật khẩu mới bên dưới để thiết lập lại quyền truy cập cho người dùng này. Mã hóa tự động 256-bit.</p>
                            
                            <form onSubmit={handleChangePassword}>
                                <div className="row align-items-end">
                                    <div className="col-md-8 mb-3 mb-md-0">
                                        <label className="form-label text-muted fw-bold small text-uppercase">Mật khẩu mới</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-3 custom-input" 
                                            placeholder="Nhập ít nhất 5 ký tự..." 
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            disabled={!canEditInfo}
                                        />
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <button type="submit" className="btn btn-warning w-100 rounded-3 fw-bold shadow-sm" disabled={!canEditInfo}>
                                            Cập Nhật Mật Khẩu
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* ========================================= */}
                    {/* CỘT PHẢI: QUẢN LÝ & THÔNG TIN HỆ THỐNG */}
                    {/* ========================================= */}
                    <div className="col-lg-4">
                        
                        {/* Bảng 1: Trạng thái & Quyền hạn */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <h6 className="fw-bold mb-4 text-dark"><i className="bi bi-shield-shaded me-2 text-success"></i>Bảo mật & Quyền hạn</h6>
                            
                            <div className="mb-4">
                                <div className="info-row">
                                    <span className="text-muted fw-bold small">Vai trò:</span>
                                    {targetUser.isSuperAdmin 
                                        ? <span className="badge bg-danger bg-opacity-10 text-danger badge-status rounded-pill"><i className="bi bi-star-fill me-1"></i> Super Admin</span>
                                        : targetUser.isAdmin 
                                            ? <span className="badge bg-primary bg-opacity-10 text-primary badge-status rounded-pill"><i className="bi bi-shield-fill-check me-1"></i> Quản trị viên</span> 
                                            : <span className="badge bg-secondary bg-opacity-10 text-secondary badge-status rounded-pill"><i className="bi bi-person-fill me-1"></i> Khách hàng</span>
                                    }
                                </div>
                                <div className="info-row">
                                    <span className="text-muted fw-bold small">Truy cập:</span>
                                    {targetUser.isBlocked 
                                        ? <span className="badge bg-danger bg-opacity-10 text-danger badge-status rounded-pill"><i className="bi bi-lock-fill me-1"></i> Đã bị cấm</span> 
                                        : <span className="badge bg-success bg-opacity-10 text-success badge-status rounded-pill"><i className="bi bi-check-circle-fill me-1"></i> Hoạt động</span>
                                    }
                                </div>
                            </div>

                            <div className="d-grid gap-3">
                                {/* Nút Phân quyền */}
                                <button 
                                    className={`btn btn-action-outline rounded-3 py-2 ${targetUser.isAdmin ? 'btn-outline-warning text-dark' : 'btn-outline-primary'}`} 
                                    onClick={handleToggleRole}
                                    disabled={!canEditRole}
                                    title={!canEditRole ? "Chỉ Super Admin mới có quyền này" : ""}
                                >
                                    <i className={`bi ${targetUser.isAdmin ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'} me-2`}></i>
                                    {targetUser.isAdmin ? 'Hạ cấp Khách hàng' : 'Cấp quyền Admin'}
                                </button>

                                {/* Nút Khóa/Mở */}
                                <button 
                                    className={`btn btn-action-outline rounded-3 py-2 ${targetUser.isBlocked ? 'btn-outline-info' : 'btn-outline-dark'}`} 
                                    onClick={handleToggleBlock}
                                    disabled={!canBlock}
                                    title={!canBlock ? "Bạn không có quyền khóa tài khoản này" : ""}
                                >
                                    <i className={`bi ${targetUser.isBlocked ? 'bi-unlock-fill' : 'bi-lock-fill'} me-2`}></i>
                                    {targetUser.isBlocked ? 'Mở khóa tài khoản' : 'Cấm truy cập'}
                                </button>

                                {/* Nút Xóa ĐÃ ĐƯỢC CHẶN LẠI VÀ THÔNG BÁO RÕ RÀNG */}
                                <button 
                                    className="btn btn-action-outline btn-outline-danger rounded-3 py-2 mt-2" 
                                    onClick={handleDelete}
                                    disabled={!canDelete}
                                    title={!canDelete ? "Hệ thống: Chỉ Super Admin mới có quyền Xóa tài khoản!" : ""}
                                >
                                    <i className="bi bi-trash3-fill me-2"></i>Xóa vĩnh viễn
                                </button>
                            </div>
                        </div>

                        {/* Bảng 2: Thông tin hệ thống */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                            <h6 className="fw-bold mb-3 text-dark"><i className="bi bi-hdd-stack-fill me-2 text-success"></i>Dữ liệu hệ thống</h6>
                            <div className="info-row">
                                <span className="text-muted small">ID:</span>
                                <span className="text-dark small font-monospace bg-light px-2 py-1 rounded border">{targetUser._id}</span>
                            </div>
                            <div className="info-row">
                                <span className="text-muted small">Ngày tạo:</span>
                                <span className="text-dark small fw-bold">{new Date(targetUser.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="info-row">
                                <span className="text-muted small">Cập nhật:</span>
                                <span className="text-dark small fw-bold">{new Date(targetUser.updatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserEditPage;