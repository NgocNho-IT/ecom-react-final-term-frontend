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
    
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'overview');
    const handleTabChange = (tab) => { setActiveTab(tab); localStorage.setItem('adminActiveTab', tab); };

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false); 

    // STATES BỘ LỌC TÌM KIẾM
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('all');
    const [orderDate, setOrderDate] = useState('');

    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('all');

    const [categorySearch, setCategorySearch] = useState('');

    // STATES PHÂN TRANG CHO TỪNG TAB
    const [currentPageOrders, setCurrentPageOrders] = useState(1);
    const [currentPageProducts, setCurrentPageProducts] = useState(1);
    const [currentPageCategories, setCurrentPageCategories] = useState(1);

    // Dùng Debounce: Chỉ gửi API sau khi người dùng ngừng gõ 500ms
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get('/admin/dashboard', {
                    params: {
                        orderPage: currentPageOrders, orderSearch, orderStatus, orderDate,
                        productPage: currentPageProducts, productSearch, productCategory,
                        categoryPage: currentPageCategories, categorySearch
                    }
                });
                if (response.data.success) { setData(response.data); }
                setLoading(false);
            } catch (error) { setLoading(false); }
        };

        const timer = setTimeout(() => {
            if (!user || !user.isAdmin) navigate('/');
            else fetchDashboard();
        }, 500);

        return () => clearTimeout(timer);
    }, [
        currentPageOrders, orderSearch, orderStatus, orderDate,
        currentPageProducts, productSearch, productCategory,
        currentPageCategories, categorySearch, user, navigate
    ]);

    // Gọi lại API ngay lập tức khi Thêm/Sửa/Xóa thành công
    const refreshData = async () => {
        const response = await API.get('/admin/dashboard', {
            params: {
                orderPage: currentPageOrders, orderSearch, orderStatus, orderDate,
                productPage: currentPageProducts, productSearch, productCategory,
                categoryPage: currentPageCategories, categorySearch
            }
        });
        if (response.data.success) setData(response.data);
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const response = await API.get('/admin/export-excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'BaoCao_DoanhThu_NNITShop.xlsx');
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
        } catch (error) { alert("Lỗi khi xuất file Excel. Vui lòng thử lại!"); } finally { setIsExporting(false); }
    };

    const handleShipOrder = async (orderId) => {
        try {
            const { data: res } = await API.put(`/admin/order/${orderId}/ship`);
            if (res.success) { alert(res.message); refreshData(); }
        } catch (err) { alert("Lỗi xác nhận đơn hàng!"); }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Bạn chắc chắn muốn xóa đơn hàng này?")) {
            try {
                const { data: res } = await API.delete(`/admin/order/${orderId}`);
                if (res.success) { alert(res.message); refreshData(); }
            } catch (err) { alert("Lỗi khi xóa đơn hàng!"); }
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Bạn muốn xóa sản phẩm ${productName}?`)) {
            try {
                const { data: res } = await API.delete(`/admin/product/${productId}`);
                if (res.success) { alert(res.message); refreshData(); }
            } catch (err) { alert("Lỗi khi xóa sản phẩm!"); }
        }
    };

    const handleDeleteCategory = async (catId, catName) => {
        if (window.confirm(`Xóa danh mục ${catName} có thể làm mất sản phẩm bên trong, bạn chắc chưa?`)) {
            try {
                const { data: res } = await API.delete(`/admin/category/${catId}`);
                if (res.success) { alert(res.message); refreshData(); }
            } catch (err) { alert(err.response?.data?.message || "Lỗi khi xóa danh mục!"); }
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    // COMPONENT VẼ THANH PHÂN TRANG (TÁI SỬ DỤNG CHO 3 TAB)
    const renderPagination = (totalItems, currentPage, setCurrentPage) => {
        const totalPages = Math.ceil(totalItems / 10);
        if (totalPages <= 1) return null;

        return (
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top px-3">
                <span className="small text-muted fw-bold">
                    Trang {currentPage} / {totalPages} (Tổng: {totalItems})
                </span>
                <ul className="pagination pagination-sm mb-0 shadow-sm">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link text-success" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Trước</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(i + 1)} style={currentPage === i + 1 ? { backgroundColor: '#198754', borderColor: '#198754', color: 'white' } : { color: '#198754' }}>{i + 1}</button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link text-success" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Sau</button>
                    </li>
                </ul>
            </div>
        );
    };

    const barChartData = data ? { labels: data.daysList || [], datasets: [{ label: 'Doanh thu (₫)', data: data.revenuesList || [], backgroundColor: 'rgba(25, 135, 84, 0.7)', borderColor: '#198754', borderWidth: 2, borderRadius: 5 }] } : null;
    const doughnutChartData = data ? { labels: ['Đã giao', 'Chờ xử lý'], datasets: [{ data: [data.shippedCount || 0, data.pendingCount || 0], backgroundColor: ['#198754', '#ffc107'] }] } : null;

    if (loading) return <div className="text-center mt-5 mb-5" style={{ zIndex: 10000, position: 'relative' }}><h3>Đang tải Dashboard...</h3></div>;
    if (!data) return <div className="text-center mt-5 mb-5" style={{ zIndex: 10000, position: 'relative' }}><h3>Không có dữ liệu!</h3></div>;

    return (
        <div className="admin-fullscreen-layout">
            <style>
                {`
                    .admin-fullscreen-layout { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #f4f6f9; z-index: 9999; display: flex; overflow: hidden; }
                    .admin-sidebar { width: 260px; background-color: #ffffff; height: 100vh; box-shadow: 2px 0 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; flex-shrink: 0; z-index: 100; }
                    .admin-main { flex-grow: 1; height: 100vh; overflow-y: auto; padding: 30px; }
                    .admin-main::-webkit-scrollbar, .table-scroll-container::-webkit-scrollbar { width: 6px; height: 6px; }
                    .admin-main::-webkit-scrollbar-thumb, .table-scroll-container::-webkit-scrollbar-thumb { background-color: #198754; border-radius: 10px; }
                    .admin-main::-webkit-scrollbar-track, .table-scroll-container::-webkit-scrollbar-track { background-color: #e9ecef; }
                    .admin-sidebar .nav-pills .nav-link { color: #495057; font-weight: 500; border-radius: 10px; padding: 12px 20px; margin-bottom: 8px; transition: 0.3s; border: none; background: transparent; }
                    .admin-sidebar .nav-pills .nav-link.active { background-color: #198754; color: white; box-shadow: 0 4px 10px rgba(25, 135, 84, 0.3); }
                    .admin-sidebar .nav-pills .nav-link:hover:not(.active) { background-color: #e9ecef; color: #198754; }
                    .img-product-admin { width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
                    .table-scroll-container { max-height: calc(100vh - 250px); overflow-y: auto; }
                `}
            </style>

            <div className="admin-sidebar p-3">
                <div className="text-center mb-4 mt-2 pb-3 border-bottom">
                    <h4 className="fw-bold text-success mb-0"><i className="bi bi-shield-lock-fill me-2"></i>NNIT ADMIN</h4>
                    <small className="text-muted">Bảng điều khiển trung tâm</small>
                </div>
                
                <div className="nav flex-column nav-pills flex-grow-1 overflow-y-auto">
                    <button className={`nav-link text-start ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}><i className="bi bi-graph-up me-2"></i>Tổng quan</button>
                    <button className={`nav-link text-start ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}><i className="bi bi-cart3 me-2"></i>Đơn hàng</button>
                    <button className={`nav-link text-start ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')}><i className="bi bi-box-seam me-2"></i>Sản phẩm</button>
                    <button className={`nav-link text-start ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleTabChange('categories')}><i className="bi bi-tags me-2"></i>Danh mục</button>
                    <hr className="my-3"/>
                    <Link to="/admin/product/add" className="btn btn-success rounded-pill btn-sm mb-2 py-2"><i className="bi bi-plus-circle me-1"></i> Thêm SP Mới</Link>
                    <button onClick={handleExportExcel} disabled={isExporting} className="btn btn-outline-success rounded-pill btn-sm mb-2 py-2">
                        {isExporting ? <><span className="spinner-border spinner-border-sm me-1"></span> Đang tải...</> : <><i className="bi bi-file-earmark-excel me-1"></i> Xuất Excel</>}
                    </button>
                </div>

                <div className="mt-auto pt-3 border-top">
                    <Link to="/" className="btn btn-outline-dark w-100 rounded-pill fw-bold"><i className="bi bi-house-door me-2"></i>Về Trang Chủ</Link>
                </div>
            </div>

            <div className="admin-main">
                <div className="tab-content">
                    
                    {/* TAB TỔNG QUAN */}
                    {activeTab === 'overview' && (
                        <div className="tab-pane show active">
                            <h2 className="fw-bold text-success mb-4 text-uppercase">TỔNG QUAN HỆ THỐNG</h2>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm bg-success text-white p-3 rounded-4 h-100">
                                        <small className="text-uppercase fw-bold opacity-75 small">Doanh Thu</small>
                                        <h4 className="fw-bold mb-0 mt-1">{formatPrice(data.totalRevenue)} ₫</h4>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm bg-primary text-white p-3 rounded-4 h-100">
                                        <small className="text-uppercase fw-bold opacity-75 small">Đơn Hàng</small>
                                        <h4 className="fw-bold mb-0 mt-1">{data.totalOrders}</h4>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm bg-warning text-dark p-3 rounded-4 h-100">
                                        <small className="text-uppercase fw-bold opacity-75 small">Chờ Xử Lý</small>
                                        <h4 className="fw-bold mb-0 mt-1">{data.pendingCount}</h4>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card border-0 shadow-sm bg-info text-white p-3 rounded-4 h-100">
                                        <small className="text-uppercase fw-bold opacity-75 small">Tổng Sản Phẩm</small>
                                        <h4 className="fw-bold mb-0 mt-1">{data.totalProducts}</h4>
                                    </div>
                                </div>
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-md-8">
                                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ height: '400px' }}>
                                        {barChartData && <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm p-4 rounded-4" style={{ height: '400px' }}>
                                        {doughnutChartData && <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB ĐƠN HÀNG */}
                    {activeTab === 'orders' && (
                        <div className="tab-pane show active">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-3 text-uppercase text-success">Quản Lý Đơn Hàng</h5>
                                    <div className="row g-2">
                                        <div className="col-md-4">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill" placeholder="Tên khách hàng hoặc Mã đơn..." value={orderSearch} onChange={e => {setOrderSearch(e.target.value); setCurrentPageOrders(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <select className="form-select form-select-sm rounded-pill" value={orderStatus} onChange={e => {setOrderStatus(e.target.value); setCurrentPageOrders(1);}}>
                                                <option value="all">Tất cả trạng thái</option>
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="shipped">Đã giao hàng</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <input type="date" className="form-control form-control-sm rounded-pill" value={orderDate} onChange={e => {setOrderDate(e.target.value); setCurrentPageOrders(1);}} />
                                        </div>
                                        <div className="col-md-2">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => {setOrderSearch(''); setOrderStatus('all'); setOrderDate(''); setCurrentPageOrders(1);}}>Xóa lọc</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                            <tr><th>Mã đơn</th><th>Khách hàng</th><th>Tiền</th><th>Trạng thái</th><th>Hành động</th></tr>
                                        </thead>
                                        <tbody>
                                            {/* SỬ DỤNG data.orders (Dữ liệu 10 dòng từ Backend gửi sang) */}
                                            {data.orders?.length > 0 ? data.orders.map(order => (
                                                <tr key={order._id}>
                                                    <td className="text-primary fw-bold">#{order._id.substring(18, 24).toUpperCase()}</td>
                                                    <td>{order.shippingInfo?.fullName}</td>
                                                    <td className="text-danger fw-bold">{formatPrice(order.amountPaid)} ₫</td>
                                                    <td>
                                                        {order.isShipped ? 
                                                            <span className="badge rounded-pill bg-success">Đã giao</span> : 
                                                            <span className="badge rounded-pill bg-warning text-dark">Chờ</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            {!order.isShipped && (
                                                                <button className="btn btn-sm btn-success rounded-pill px-2" onClick={() => handleShipOrder(order._id)}>Xác nhận</button>
                                                            )}
                                                            <Link to={`/admin/order/edit/${order._id}`} className="btn btn-sm btn-outline-primary rounded-circle"><i className="bi bi-pencil"></i></Link>
                                                            <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDeleteOrder(order._id)}><i className="bi bi-trash"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Không tìm thấy đơn hàng nào!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalOrdersCount, currentPageOrders, setCurrentPageOrders)}
                            </div>
                        </div>
                    )}

                    {/* TAB SẢN PHẨM */}
                    {activeTab === 'products' && (
                        <div className="tab-pane show active">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-3 text-uppercase text-success">Kho Sản Phẩm</h5>
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill" placeholder="Tìm kiếm theo tên sản phẩm..." value={productSearch} onChange={e => {setProductSearch(e.target.value); setCurrentPageProducts(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <select className="form-select form-select-sm rounded-pill" value={productCategory} onChange={e => {setProductCategory(e.target.value); setCurrentPageProducts(1);}}>
                                                <option value="all">Tất cả danh mục</option>
                                                {data.categories?.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => {setProductSearch(''); setProductCategory('all'); setCurrentPageProducts(1);}}>Xóa lọc</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                            <tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Hành động</th></tr>
                                        </thead>
                                        <tbody>
                                            {/* SỬ DỤNG data.products */}
                                            {data.products?.length > 0 ? data.products.map(product => (
                                                <tr key={product._id}>
                                                    <td><img src={`${BACKEND_URL}/${product.image}`} className="img-product-admin" alt="product" onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }}/></td>
                                                    <td className="fw-bold">{product.name}</td>
                                                    <td>{product.category?.name}</td>
                                                    <td>
                                                        <Link to={`/admin/product/edit/${product._id}`} className="btn btn-sm btn-outline-primary rounded-circle me-1"><i className="bi bi-pencil"></i></Link>
                                                        <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDeleteProduct(product._id, product.name)}><i className="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalProductsCount, currentPageProducts, setCurrentPageProducts)}
                            </div>
                        </div>
                    )}

                    {/* TAB DANH MỤC */}
                    {activeTab === 'categories' && (
                        <div className="tab-pane show active">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2">
                                <div className="card-header bg-white py-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold mb-0 text-uppercase text-success">Quản Lý Danh Mục</h5>
                                        <Link to="/admin/category/add" className="btn btn-sm btn-success rounded-pill px-3"><i className="bi bi-plus"></i> Thêm mới</Link>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-md-9">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                <input type="text" className="form-control rounded-end-pill" placeholder="Tìm tên danh mục (VD: iPhone, Samsung...)" value={categorySearch} onChange={e => {setCategorySearch(e.target.value); setCurrentPageCategories(1);}} />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => {setCategorySearch(''); setCurrentPageCategories(1);}}>Xóa lọc</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                            <tr><th className="ps-4">ID</th><th>Tên danh mục</th><th>Số sản phẩm</th><th>Hành động</th></tr>
                                        </thead>
                                        <tbody>
                                            {/* SỬ DỤNG data.categories */}
                                            {data.categories?.length > 0 ? data.categories.map(cat => (
                                                <tr key={cat._id}>
                                                    <td className="ps-4 text-secondary">#{cat._id.substring(18, 24).toUpperCase()}</td>
                                                    <td className="fw-bold">{cat.name}</td>
                                                    <td>{cat.productCount}</td> 
                                                    <td>
                                                        <Link to={`/admin/category/edit/${cat._id}`} className="btn btn-sm btn-outline-primary rounded-circle me-1"><i className="bi bi-pencil"></i></Link>
                                                        <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDeleteCategory(cat._id, cat.name)}><i className="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy danh mục nào!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalCategoriesCount, currentPageCategories, setCurrentPageCategories)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;