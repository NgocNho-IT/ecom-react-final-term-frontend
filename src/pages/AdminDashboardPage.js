import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);
const BACKEND_URL = "http://localhost:5000";

const AdminDashboardPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // ==========================================
    // HÀM KIỂM TRA QUYỀN TRUY CẬP (RBAC)
    // ==========================================
    const hasPerm = (moduleName) => {
        if (user?.isSuperAdmin) return true;
        return user?.permissions?.includes(moduleName);
    };

    // Xác định Tab mặc định dựa trên quyền hiện có
    const getDefaultTab = () => {
        const savedTab = localStorage.getItem('adminActiveTab');
        if (savedTab && hasPerm(savedTab.toUpperCase())) return savedTab;
        if (hasPerm('DASHBOARD')) return 'overview';
        if (hasPerm('USERS')) return 'users';
        if (hasPerm('ORDERS')) return 'orders';
        if (hasPerm('PRODUCTS')) return 'products';
        if (hasPerm('CATEGORIES')) return 'categories';
        if (hasPerm('REVIEWS')) return 'reviews';
        return 'unauthorized'; 
    };

    // ==========================================
    // QUẢN LÝ TAB & SIDEBAR MỚI (THU VÔ THU RA)
    // ==========================================
    const [activeTab, setActiveTab] = useState(getDefaultTab());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleTabChange = (tab) => { 
        setActiveTab(tab); 
        localStorage.setItem('adminActiveTab', tab); 
    };
    
    // ==========================================
    // STATES CHUNG & TÌM KIẾM
    // ==========================================
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false); 

    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('all');
    const [orderDate, setOrderDate] = useState('');
    
    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('all');
    
    const [categorySearch, setCategorySearch] = useState('');
    
    const [reviewSearch, setReviewSearch] = useState('');
    const [reviewCategory, setReviewCategory] = useState('all');
    const [reviewDate, setReviewDate] = useState(''); 
    
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('all');

    const [pageOrders, setPageOrders] = useState(1);
    const [pageProducts, setPageProducts] = useState(1);
    const [pageCategories, setPageCategories] = useState(1);
    const [pageReviews, setPageReviews] = useState(1);
    const [pageUsers, setPageUsers] = useState(1);

    // ==========================================
    // GỌI API LẤY DỮ LIỆU
    // ==========================================
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get('/admin/dashboard', {
                    params: { 
                        orderPage: pageOrders, orderSearch, orderStatus, orderDate, 
                        productPage: pageProducts, productSearch, productCategory, 
                        categoryPage: pageCategories, categorySearch, 
                        reviewPage: pageReviews, reviewSearch, reviewCategory, reviewDate, 
                        userPage: pageUsers, userSearch, userRole 
                    }
                });
                if (response.data && response.data.success) {
                    setData(response.data);
                }
                setLoading(false);
            } catch (error) { 
                console.error("Lỗi tải dashboard", error);
                setLoading(false); 
            }
        };

        const timer = setTimeout(() => { 
            if (!user || !user.isAdmin) {
                navigate('/'); 
            } else {
                fetchDashboard(); 
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [
        pageOrders, orderSearch, orderStatus, orderDate, 
        pageProducts, productSearch, productCategory, 
        pageCategories, categorySearch, 
        pageReviews, reviewSearch, reviewCategory, reviewDate, 
        pageUsers, userSearch, userRole, 
        user, navigate
    ]);

    const refreshData = async () => {
        try {
            const response = await API.get('/admin/dashboard', {
                params: { 
                    orderPage: pageOrders, orderSearch, orderStatus, orderDate, 
                    productPage: pageProducts, productSearch, productCategory, 
                    categoryPage: pageCategories, categorySearch, 
                    reviewPage: pageReviews, reviewSearch, reviewCategory, reviewDate, 
                    userPage: pageUsers, userSearch, userRole 
                }
            });
            if (response.data?.success) setData(response.data);
        } catch (error) { console.error("Lỗi refresh", error); }
    };

    // ========================================================
    // CÁC HÀM XỬ LÝ HÀNH ĐỘNG
    // ========================================================
    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const response = await API.get('/admin/export-excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a'); 
            link.href = url; 
            link.setAttribute('download', 'BaoCao_DoanhThu_NNITShop.xlsx');
            document.body.appendChild(link); 
            link.click(); 
            link.parentNode.removeChild(link); 
            window.URL.revokeObjectURL(url);
        } catch (error) { alert("Lỗi khi xuất file Excel!"); } 
        finally { setIsExporting(false); }
    };

    const handleShipOrder = async (id) => { 
        try { const { data: res } = await API.put(`/admin/order/${id}/ship`); if (res.success) { alert(res.message); refreshData(); } } 
        catch (err) { alert("Lỗi xác nhận!"); } 
    };

    const handleDeleteOrder = async (id) => { 
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) { 
            try { const { data: res } = await API.delete(`/admin/order/${id}`); if (res.success) { alert(res.message); refreshData(); } } 
            catch (err) { alert("Lỗi xóa đơn hàng!"); } 
        } 
    };

    const handleDeleteProduct = async (id, name) => { 
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${name}?`)) { 
            try { const { data: res } = await API.delete(`/admin/product/${id}`); if (res.success) { alert(res.message); refreshData(); } } 
            catch (err) { alert("Lỗi xóa sản phẩm!"); } 
        } 
    };

    const handleDeleteCategory = async (id, name) => { 
        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục: ${name}?`)) { 
            try { const { data: res } = await API.delete(`/admin/category/${id}`); if (res.success) { alert(res.message); refreshData(); } } 
            catch (err) { alert(err.response?.data?.message || "Lỗi xóa danh mục!"); } 
        } 
    };

    const handleDeleteReview = async (id) => { 
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) { 
            try { const { data: res } = await API.delete(`/admin/review/${id}`); if (res.success) { alert("Đã xóa đánh giá thành công!"); refreshData(); } } 
            catch (err) { alert("Lỗi khi xóa đánh giá!"); } 
        } 
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    const renderPagination = (totalItems, currentPage, setCurrentPage) => {
        const safeTotal = Number(totalItems) || 0;
        const totalPages = Math.max(1, Math.ceil(safeTotal / 10));
        
        if (totalPages <= 1) return null;
        
        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 pt-3 border-top px-3 pb-3">
                <span className="small text-muted fw-bold mb-2 mb-md-0">
                    Trang {currentPage} / {totalPages} (Tổng: {safeTotal})
                </span>
                <ul className="pagination pagination-sm mb-0 shadow-sm flex-wrap justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link text-success" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Trước</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(i + 1)} style={currentPage === i + 1 ? { backgroundColor: '#198754', color: 'white' } : { color: '#198754' }}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link text-success" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Sau</button>
                    </li>
                </ul>
            </div>
        );
    };

    const barChartData = data?.daysList ? { 
        labels: data.daysList, 
        datasets: [{ label: 'Doanh thu (₫)', data: data.revenuesList || [], backgroundColor: 'rgba(25, 135, 84, 0.7)' }] 
    } : { labels: [], datasets: [] };

    const doughnutChartData = data ? { 
        labels: ['Đã giao', 'Chờ xử lý'], 
        datasets: [{ data: [data.shippedCount || 0, data.pendingCount || 0], backgroundColor: ['#198754', '#ffc107'] }] 
    } : { labels: [], datasets: [] };

    if (loading || !data) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#f4f6f9', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner-border text-success mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
                <h4 className="text-success fw-bold ms-3">Đang tải dữ liệu Quản trị...</h4>
            </div>
        );
    }

    // NẾU TÀI KHOẢN KHÔNG CÓ BẤT KỲ QUYỀN NÀO
    if (activeTab === 'unauthorized') {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light text-center" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 9999 }}>
                <i className="bi bi-shield-lock text-danger" style={{fontSize: '5rem'}}></i>
                <h3 className="mt-3 fw-bold">Tài khoản chưa được cấp quyền!</h3>
                <p className="text-muted">Vui lòng liên hệ Quản trị viên Tối cao (Super Admin) để được cấp quyền sử dụng hệ thống.</p>
                <Link to="/" className="btn btn-success mt-3 rounded-pill px-4">Về Trang Chủ</Link>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <style>
                {`
                    .admin-layout {
                        display: flex;
                        height: 100vh;
                        overflow: hidden;
                        background-color: #f4f6f9;
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        z-index: 9999;
                    }
                    .admin-sidebar { 
                        width: ${isSidebarCollapsed ? '80px' : '260px'}; 
                        background-color: #ffffff; 
                        height: 100vh; 
                        box-shadow: 2px 0 15px rgba(0,0,0,0.05); 
                        display: flex; 
                        flex-direction: column; 
                        flex-shrink: 0; 
                        z-index: 1050; 
                        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        overflow-x: hidden;
                    }
                    .admin-main { 
                        flex-grow: 1; 
                        height: 100vh; 
                        overflow-y: auto; 
                        padding: 30px; 
                        transition: padding 0.3s ease;
                    }
                    .admin-main::-webkit-scrollbar, .table-scroll-container::-webkit-scrollbar { width: 6px; height: 6px; }
                    .admin-main::-webkit-scrollbar-thumb, .table-scroll-container::-webkit-scrollbar-thumb { background-color: #198754; border-radius: 10px; }
                    .admin-main::-webkit-scrollbar-track, .table-scroll-container::-webkit-scrollbar-track { background-color: #e9ecef; }
                    
                    /* MẶC ĐỊNH TRÊN MÁY TÍNH (DESKTOP) */
                    .admin-sidebar .nav-pills .nav-link { 
                        color: #495057; 
                        font-weight: 500; 
                        border-radius: 10px; 
                        padding: 12px ${isSidebarCollapsed ? '0' : '20px'}; 
                        margin-bottom: 8px; 
                        transition: all 0.3s; 
                        border: none; 
                        background: transparent; 
                        display: flex;
                        align-items: center;
                        justify-content: ${isSidebarCollapsed ? 'center' : 'flex-start'};
                        white-space: nowrap;
                    }
                    .admin-sidebar .nav-pills .nav-link i { font-size: 1.25rem; margin-right: ${isSidebarCollapsed ? '0' : '10px'}; transition: margin 0.3s ease; }
                    .sidebar-text { opacity: ${isSidebarCollapsed ? '0' : '1'}; display: ${isSidebarCollapsed ? 'none' : 'inline-block'}; transition: opacity 0.3s ease; }
                    .admin-sidebar .nav-pills .nav-link.active { background-color: #198754; color: white; box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3); }
                    .admin-sidebar .nav-pills .nav-link:hover:not(.active) { background-color: #e9ecef; color: #198754; }
                    
                    .img-product-admin { width: 45px; height: 45px; object-fit: contain; border-radius: 8px; border: 1px solid #eee; background: white; }
                    .table-scroll-container { max-height: calc(100vh - 250px); overflow-y: auto; }
                    .btn-action { border-radius: 8px; padding: 5px 12px; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; }
                    .btn-icon-only { width: 34px; height: 34px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; padding: 0; }

                    /* BẢN RESPONSIVE MOBILE ĐỈNH CAO - FIX LỖI BAY MÀU */
                    @media (max-width: 991.98px) {
                        .admin-layout { flex-direction: column; }
                        .admin-sidebar {
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            width: 100% !important;
                            height: auto !important;
                            flex-direction: row;
                            justify-content: space-around;
                            padding: 8px 5px !important;
                            box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
                            padding-bottom: calc(8px + env(safe-area-inset-bottom));
                        }
                        .admin-sidebar-header, .admin-sidebar-footer { display: none !important; }
                        .admin-sidebar .nav-pills {
                            flex-direction: row !important;
                            width: 100%;
                            justify-content: space-between;
                        }
                        .admin-sidebar .nav-pills .nav-link {
                            flex-direction: column;
                            padding: 8px 4px !important;
                            margin-bottom: 0 !important;
                            font-size: 10px;
                            flex: 1;
                            text-align: center;
                            justify-content: center !important;
                            color: #adb5bd !important; 
                        }
                        
                        /* ĐÂY LÀ ĐOẠN FIX LỖI BAY MÀU TRÊN MOBILE */
                        .admin-sidebar .nav-pills .nav-link.active {
                            background-color: transparent !important; 
                            color: #198754 !important; 
                            box-shadow: none !important;
                            font-weight: 800;
                        }
                        .admin-sidebar .nav-pills .nav-link:hover:not(.active) {
                            background-color: transparent !important;
                            color: #198754 !important;
                        }
                        
                        .admin-sidebar .nav-pills .nav-link i { margin-right: 0 !important; margin-bottom: 4px; font-size: 1.35rem; }
                        .sidebar-text { display: block !important; opacity: 1 !important; white-space: nowrap; }
                        
                        .admin-main { padding: 15px !important; padding-bottom: 85px !important; }
                        .mobile-topbar { display: flex !important; }
                        .table-scroll-container { max-height: calc(100vh - 280px); }
                    }
                    @media (min-width: 992px) {
                        .mobile-topbar { display: none !important; }
                    }
                `}
            </style>

            {/* TOPBAR RIÊNG CHO MOBILE */}
            <div className="mobile-topbar bg-white shadow-sm p-3 align-items-center justify-content-between z-3 border-bottom">
                <h5 className="fw-bolder text-success mb-0" onClick={() => hasPerm('DASHBOARD') && handleTabChange('overview')}>NNIT ADMIN</h5>
                <div className="d-flex gap-2">
                    {/* KIỂM TRA QUYỀN THÊM SẢN PHẨM */}
                    {hasPerm('ADD_PRODUCT') && (
                        <Link to="/admin/product/add" className="btn btn-sm btn-success shadow-sm fw-bold"><i className="bi bi-plus-lg"></i> Mới</Link>
                    )}
                    {/* KIỂM TRA QUYỀN XUẤT EXCEL */}
                    {hasPerm('EXPORT_EXCEL') && (
                        <button onClick={handleExportExcel} disabled={isExporting} className="btn btn-sm btn-outline-success shadow-sm fw-bold">
                            {isExporting ? <i className="bi bi-hourglass"></i> : <i className="bi bi-file-earmark-excel"></i>} Excel
                        </button>
                    )}
                    <Link to="/" className="btn btn-sm btn-outline-dark shadow-sm"><i className="bi bi-house-door-fill"></i></Link>
                </div>
            </div>
            
            {/* SIDEBAR DESKTOP & BOTTOM NAV MOBILE */}
            <div className="admin-sidebar p-3">
                <div className={`admin-sidebar-header d-flex ${isSidebarCollapsed ? 'justify-content-center' : 'justify-content-between'} align-items-center mb-4 mt-2 pb-3 border-bottom`}>
                    {!isSidebarCollapsed && (
                        <h4 className="fw-bolder text-success mb-0 cursor-pointer text-nowrap" onClick={() => hasPerm('DASHBOARD') && handleTabChange('overview')} style={{ cursor: 'pointer', letterSpacing: '0.5px' }}>
                            NNIT ADMIN
                        </h4>
                    )}
                    <button 
                        className="btn btn-sm btn-light shadow-sm rounded-3 border-0 d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                        <i className={`bi ${isSidebarCollapsed ? 'bi-list' : 'bi-text-indent-right'} fs-5 text-success mb-0`}></i>
                    </button>
                </div>

                <div className="nav flex-column nav-pills flex-grow-1 overflow-y-auto overflow-x-hidden">
                    {hasPerm('DASHBOARD') && (
                        <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')} title={isSidebarCollapsed ? "Tổng quan" : ""}>
                            <i className="bi bi-graph-up"></i><span className="sidebar-text">Tổng quan</span>
                        </button>
                    )}
                    {hasPerm('USERS') && (
                        <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => handleTabChange('users')} title={isSidebarCollapsed ? "Tài khoản" : ""}>
                            <i className="bi bi-people"></i><span className="sidebar-text">Tài khoản</span>
                        </button>
                    )}
                    {hasPerm('ORDERS') && (
                        <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')} title={isSidebarCollapsed ? "Đơn hàng" : ""}>
                            <i className="bi bi-cart3"></i><span className="sidebar-text">Đơn hàng</span>
                        </button>
                    )}
                    {hasPerm('PRODUCTS') && (
                        <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')} title={isSidebarCollapsed ? "Sản phẩm" : ""}>
                            <i className="bi bi-box-seam"></i><span className="sidebar-text">Sản phẩm</span>
                        </button>
                    )}
                    {hasPerm('CATEGORIES') && (
                        <button className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleTabChange('categories')} title={isSidebarCollapsed ? "Danh mục" : ""}>
                            <i className="bi bi-tags"></i><span className="sidebar-text">Danh mục</span>
                        </button>
                    )}
                    {hasPerm('REVIEWS') && (
                        <button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')} title={isSidebarCollapsed ? "Đánh giá" : ""}>
                            <i className="bi bi-chat-left-dots"></i><span className="sidebar-text">Đánh giá</span>
                        </button>
                    )}
                </div>

                <div className="admin-sidebar-footer mt-auto pt-3 border-top">
                    {/* KIỂM TRA QUYỀN THÊM SẢN PHẨM Ở SIDEBAR */}
                    {hasPerm('ADD_PRODUCT') && (
                        <Link to="/admin/product/add" className={`btn btn-success w-100 rounded-pill btn-sm mb-2 py-2 fw-bold ${isSidebarCollapsed ? 'px-0' : ''}`} title={isSidebarCollapsed ? "Thêm Sản Phẩm" : ""}>
                            <i className={`bi bi-plus-circle ${isSidebarCollapsed ? 'fs-5' : 'me-1'}`}></i>
                            <span className="sidebar-text">Thêm Sản Phẩm</span>
                        </Link>
                    )}
                    {/* KIỂM TRA QUYỀN XUẤT EXCEL Ở SIDEBAR */}
                    {hasPerm('EXPORT_EXCEL') && (
                        <button onClick={handleExportExcel} disabled={isExporting} className={`btn btn-outline-success w-100 rounded-pill btn-sm mb-2 py-2 fw-bold ${isSidebarCollapsed ? 'px-0' : ''}`} title={isSidebarCollapsed ? "Xuất Excel" : ""}>
                            {isExporting ? <i className="bi bi-hourglass-split"></i> : <><i className={`bi bi-file-earmark-excel ${isSidebarCollapsed ? 'fs-5' : 'me-1'}`}></i><span className="sidebar-text">Xuất Excel</span></>}
                        </button>
                    )}
                    <Link to="/" className={`btn btn-outline-dark w-100 rounded-pill btn-sm py-2 fw-bold mt-2 ${isSidebarCollapsed ? 'px-0' : ''}`} title={isSidebarCollapsed ? "Về Trang Chủ" : ""}>
                        <i className={`bi bi-house-door-fill ${isSidebarCollapsed ? 'fs-5' : 'd-none'}`}></i>
                        <span className="sidebar-text">Về Trang Chủ</span>
                    </Link>
                </div>
            </div>

            {/* KHU VỰC NỘI DUNG CHÍNH */}
            <div className="admin-main">
                <div className="tab-content">
                    
                    {/* TAB 1: TỔNG QUAN */}
                    {activeTab === 'overview' && hasPerm('DASHBOARD') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <h3 className="fw-bold text-success mb-4 border-start border-success border-4 ps-2">TỔNG QUAN HỆ THỐNG</h3>
                            
                            <div className="row g-3 mb-4">
                                <div className="col-6 col-md-3">
                                    <div className="card border-0 shadow-sm bg-success text-white p-3 rounded-4 h-100">
                                        <small className="fw-bold">Doanh Thu</small>
                                        <h4 className="fw-bold mb-0 text-truncate">{formatPrice(data.totalRevenue)} ₫</h4>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="card border-0 shadow-sm bg-primary text-white p-3 rounded-4 h-100">
                                        <small className="fw-bold">Đơn Hàng</small>
                                        <h4 className="fw-bold mb-0">{data.totalOrders || 0}</h4>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="card border-0 shadow-sm bg-info text-white p-3 rounded-4 h-100">
                                        <small className="fw-bold">Tổng tài khoản</small>
                                        <h4 className="fw-bold mb-0">{data.totalUsersAll || 0}</h4>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="card border-0 shadow-sm bg-warning text-dark p-3 rounded-4 h-100">
                                        <small className="fw-bold">Đánh giá mới</small>
                                        <h4 className="fw-bold mb-0">{data.totalReviewsCountAll || 0}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="row g-4 mb-4">
                                <div className="col-md-8">
                                    <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white" style={{ height: '350px' }}>
                                        <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white" style={{ height: '350px' }}>
                                        <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: QUẢN LÝ TÀI KHOẢN */}
                    {activeTab === 'users' && hasPerm('USERS') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-3 text-success">Quản Lý Tài Khoản Khách Hàng</h5>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm tên, email, sđt..." value={userSearch} onChange={e => {setUserSearch(e.target.value); setPageUsers(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-8 col-md-4">
                                            <select className="form-select form-select-sm rounded-pill shadow-none" value={userRole} onChange={e => {setUserRole(e.target.value); setPageUsers(1);}}>
                                                <option value="all">Tất cả vai trò</option>
                                                <option value="admin">Quản trị viên</option>
                                                <option value="customer">Khách hàng</option>
                                            </select>
                                        </div>
                                        <div className="col-4 col-md-2 text-end">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setUserSearch(''); setUserRole('all'); setPageUsers(1);}}>Làm mới</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center text-nowrap">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-4 text-start">Khách hàng</th>
                                                <th>Điện thoại</th>
                                                <th>Vai trò</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data.users) && data.users.length > 0 ? (
                                                data.users.map(u => {
                                                    const canEdit = user?.isSuperAdmin || user?._id === u._id || (!u.isAdmin && !u.isSuperAdmin);
                                                    return (
                                                        <tr key={u._id} className={u.isBlocked ? 'bg-light' : ''}>
                                                            <td className="ps-4 text-start">
                                                                <div className="d-flex align-items-center">
                                                                    <div className={`fw-bold rounded-circle d-flex align-items-center justify-content-center me-3 text-white ${u.isSuperAdmin ? 'bg-danger' : (u.isAdmin ? 'bg-success' : 'bg-primary')}`} style={{ width: '38px', height: '38px' }}>
                                                                        {u.lastName?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="mb-0 fw-bold d-flex align-items-center">
                                                                            {u.lastName} {u.firstName} 
                                                                            {user?._id === u._id && <span className="badge bg-secondary ms-2" style={{fontSize:'9px'}}>Bạn</span>}
                                                                        </h6>
                                                                        <small className="text-muted" style={{ fontSize: '11px' }}>{u.email}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="fw-bold">{u.phone}</td>
                                                            <td>
                                                                {u.isSuperAdmin ? (
                                                                    <span className="badge bg-danger px-3 py-2 rounded-pill"><i className="bi bi-star-fill me-1"></i>Super Admin</span>
                                                                ) : u.isAdmin ? (
                                                                    <span className="badge bg-success px-3 py-2 rounded-pill">Admin</span>
                                                                ) : (
                                                                    <span className="badge bg-secondary px-3 py-2 rounded-pill">Khách</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {u.isBlocked ? <span className="badge bg-danger px-3 py-2 rounded-pill"><i className="bi bi-lock-fill me-1"></i>Khóa</span> : <span className="badge bg-info text-white px-3 py-2 rounded-pill">Hoạt động</span>}
                                                            </td>
                                                            <td>
                                                                {canEdit ? (
                                                                    <Link to={`/admin/user/edit/${u._id}`} className="btn btn-sm btn-action btn-outline-primary shadow-sm"><i className="bi bi-pencil-square"></i> Cập nhật</Link>
                                                                ) : (
                                                                    <button className="btn btn-sm btn-action btn-outline-secondary shadow-sm disabled" title="Không đủ thẩm quyền"><i className="bi bi-shield-lock-fill"></i> Vô hiệu</button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan="5" className="py-4 text-muted fst-italic">Không tìm thấy tài khoản nào!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalUsersCount, pageUsers, setPageUsers)}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ĐƠN HÀNG */}
                    {activeTab === 'orders' && hasPerm('ORDERS') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-3 text-success">Quản Lý Đơn Hàng</h5>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-4">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm tên / Mã đơn..." value={orderSearch} onChange={e => {setOrderSearch(e.target.value); setPageOrders(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <select className="form-select form-select-sm rounded-pill shadow-none" value={orderStatus} onChange={e => {setOrderStatus(e.target.value); setPageOrders(1);}}>
                                                <option value="all">Trạng thái</option>
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="shipped">Đã giao</option>
                                            </select>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <input type="date" className="form-control form-control-sm rounded-pill shadow-none" value={orderDate} onChange={e => {setOrderDate(e.target.value); setPageOrders(1);}} />
                                        </div>
                                        <div className="col-12 col-md-2">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setOrderSearch(''); setOrderStatus('all'); setOrderDate(''); setPageOrders(1);}}>Làm mới</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center text-nowrap">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data.orders) && data.orders.length > 0 ? (
                                                data.orders.map(order => (
                                                    <tr key={order._id}>
                                                        <td className="text-primary fw-bold">#{String(order._id).substring(18, 24).toUpperCase()}</td>
                                                        <td>{order.shippingInfo?.fullName}</td>
                                                        <td className="text-danger fw-bold">{formatPrice(order.amountPaid)} ₫</td>
                                                        <td>
                                                            {order.isShipped ? <span className="badge rounded-pill bg-success px-3 py-2">Đã giao</span> : <span className="badge rounded-pill bg-warning text-dark px-3 py-2">Chờ xử lý</span>}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                {!order.isShipped && <button title="Xác nhận" className="btn btn-icon-only btn-success shadow-sm" onClick={() => handleShipOrder(order._id)}><i className="bi bi-check-lg" style={{margin:0}}></i></button>}
                                                                <Link to={`/admin/order/edit/${order._id}`} className="btn btn-icon-only btn-outline-primary shadow-sm" title="Sửa"><i className="bi bi-pencil" style={{margin:0}}></i></Link>
                                                                <button className="btn btn-icon-only btn-outline-danger shadow-sm" onClick={() => handleDeleteOrder(order._id)} title="Xóa"><i className="bi bi-trash" style={{margin:0}}></i></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="py-4 text-muted fst-italic">Trống!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalOrdersCount, pageOrders, setPageOrders)}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: SẢN PHẨM */}
                    {activeTab === 'products' && hasPerm('PRODUCTS') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-3 text-success">Quản Lý Sản Phẩm</h5>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-5">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm sản phẩm..." value={productSearch} onChange={e => {setProductSearch(e.target.value); setPageProducts(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-8 col-md-4">
                                            <select className="form-select form-select-sm rounded-pill shadow-none" value={productCategory} onChange={e => {setProductCategory(e.target.value); setPageProducts(1);}}>
                                                <option value="all">Tất cả danh mục</option>
                                                {Array.isArray(data.categories) && data.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-4 col-md-3 text-end">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setProductSearch(''); setProductCategory('all'); setPageProducts(1);}}>Làm mới</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center text-nowrap">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-4 text-start">Ảnh</th>
                                                <th className="text-start">Tên sản phẩm</th>
                                                <th>Danh mục</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data.products) && data.products.length > 0 ? (
                                                data.products.map(product => (
                                                    <tr key={product._id}>
                                                        <td className="ps-4 text-start">
                                                            <img src={`${BACKEND_URL}/${product.image}`} className="img-product-admin shadow-sm" alt="p" onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }} />
                                                        </td>
                                                        <td className="fw-bold text-start">{product.name}</td>
                                                        <td><span className="badge bg-light text-dark border px-3 py-2">{product.category?.name}</span></td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <Link to={`/admin/product/edit/${product._id}`} className="btn btn-icon-only btn-outline-primary shadow-sm"><i className="bi bi-pencil-fill" style={{margin:0}}></i></Link>
                                                                <button className="btn btn-icon-only btn-outline-danger shadow-sm" onClick={() => handleDeleteProduct(product._id, product.name)}><i className="bi bi-trash-fill" style={{margin:0}}></i></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted">Trống!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalProductsCount, pageProducts, setPageProducts)}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: DANH MỤC */}
                    {activeTab === 'categories' && hasPerm('CATEGORIES') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold mb-0 text-success">Quản Lý Danh Mục</h5>
                                        <Link to="/admin/category/add" className="btn btn-sm btn-success rounded-pill px-4 fw-bold shadow-sm"><i className="bi bi-plus-lg me-1"></i> Mới</Link>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <input type="text" className="form-control form-control-sm rounded-pill px-4 shadow-none" placeholder="Tìm tên..." value={categorySearch} onChange={e => {setCategorySearch(e.target.value); setPageCategories(1);}} />
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center text-nowrap">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-4 text-start">ID</th>
                                                <th className="text-start">Tên</th>
                                                <th>Số SP</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data.categories) && data.categories.length > 0 ? (
                                                data.categories.map(cat => (
                                                    <tr key={cat._id}>
                                                        <td className="ps-4 text-secondary small text-start">#{String(cat._id).substring(18, 24).toUpperCase()}</td>
                                                        <td className="fw-bold text-start">{cat.name}</td>
                                                        <td><span className="badge rounded-pill bg-light text-primary px-3 py-2">{cat.productCount || 0}</span></td> 
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <Link to={`/admin/category/edit/${cat._id}`} className="btn btn-icon-only btn-outline-primary shadow-sm"><i className="bi bi-pencil-square" style={{margin:0}}></i></Link>
                                                                <button className="btn btn-icon-only btn-outline-danger shadow-sm" onClick={() => handleDeleteCategory(cat._id, cat.name)}><i className="bi bi-trash" style={{margin:0}}></i></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted">Trống!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalCategoriesCount, pageCategories, setPageCategories)}
                            </div>
                        </div>
                    )}

                    {/* TAB 6: ĐÁNH GIÁ */}
                    {activeTab === 'reviews' && hasPerm('REVIEWS') && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-3 text-success">Kiểm Duyệt Đánh Giá</h5>
                                    <div className="row g-2">
                                        <div className="col-12 col-md-4">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm kiếm..." value={reviewSearch} onChange={e => {setReviewSearch(e.target.value); setPageReviews(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <select className="form-select form-select-sm rounded-pill shadow-none" value={reviewCategory} onChange={e => {setReviewCategory(e.target.value); setPageReviews(1);}}>
                                                <option value="all">Loại máy</option>
                                                {Array.isArray(data.categories) && data.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <input type="date" className="form-control form-control-sm rounded-pill shadow-none text-muted" value={reviewDate} onChange={e => {setReviewDate(e.target.value); setPageReviews(1);}} />
                                        </div>
                                        <div className="col-12 col-md-2">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setReviewSearch(''); setReviewCategory('all'); setReviewDate(''); setPageReviews(1);}}>Làm mới</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center text-nowrap">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-4 text-start">Sản phẩm</th>
                                                <th className="text-start">Khách hàng</th>
                                                <th>Số sao</th>
                                                <th>Nội dung</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(data.reviews) && data.reviews.length > 0 ? (
                                                data.reviews.map(rv => (
                                                    <tr key={rv._id}>
                                                        <td className="ps-4 text-start">
                                                            <div className="d-flex align-items-center">
                                                                <img src={`${BACKEND_URL}/${rv.product?.image}`} className="img-product-admin me-2 shadow-sm" alt="p" onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }} />
                                                                <small className="fw-bold text-truncate" style={{maxWidth: '120px'}}>{rv.product?.name || "SP đã xóa"}</small>
                                                            </div>
                                                        </td>
                                                        <td className="text-start">
                                                            <div className="fw-bold">{rv.name}</div>
                                                            <small className="text-muted" style={{fontSize: '10px'}}>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small>
                                                        </td>
                                                        <td className="text-warning fw-bold">{rv.rating} <i className="bi bi-star-fill"></i></td>
                                                        <td><p className="mb-0 small text-muted text-truncate mx-auto" style={{maxWidth: '150px'}} title={rv.content}>{rv.content}</p></td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                {rv.product?._id ? (
                                                                    <Link to={`/product/${rv.product._id}#review-${rv._id}`} target="_blank" className="btn btn-icon-only btn-outline-primary shadow-sm"><i className="bi bi-eye" style={{margin:0}}></i></Link>
                                                                ) : (
                                                                    <button className="btn btn-icon-only btn-outline-secondary shadow-sm disabled"><i className="bi bi-eye-slash" style={{margin:0}}></i></button>
                                                                )}
                                                                <button className="btn btn-icon-only btn-outline-danger shadow-sm" onClick={() => handleDeleteReview(rv._id)}><i className="bi bi-trash" style={{margin:0}}></i></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="text-center py-5 text-muted">Trống!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalReviewsCount, pageReviews, setPageReviews)}
                            </div>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;