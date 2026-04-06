import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const BACKEND_URL = "http://localhost:5000";

const AdminDashboardPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false); 

    // ================= STATES CHO BỘ LỌC TÌM KIẾM =================
    // 1. Lọc Đơn hàng
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('all');
    const [orderDate, setOrderDate] = useState('');

    // 2. Lọc Sản phẩm
    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('all');

    // 3. Lọc Danh mục
    const [categorySearch, setCategorySearch] = useState('');
    // ===============================================================

    const fetchDashboard = async () => {
        try {
            const response = await API.get('/admin/dashboard');
            if (response.data.success) {
                setData(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Admin:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchDashboard();
    }, [user, navigate]);

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
        } catch (error) {
            alert("Lỗi khi xuất file Excel. Vui lòng thử lại!");
        } finally {
            setIsExporting(false);
        }
    };

    const handleShipOrder = async (orderId) => {
        try {
            const { data: res } = await API.put(`/admin/order/${orderId}/ship`);
            if (res.success) { alert(res.message); fetchDashboard(); }
        } catch (err) { alert("Lỗi xác nhận đơn hàng!"); }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Bạn chắc chắn muốn xóa đơn hàng này?")) {
            try {
                const { data: res } = await API.delete(`/admin/order/${orderId}`);
                if (res.success) { alert(res.message); fetchDashboard(); }
            } catch (err) { alert("Lỗi khi xóa đơn hàng!"); }
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Bạn muốn xóa sản phẩm ${productName}?`)) {
            try {
                const { data: res } = await API.delete(`/admin/product/${productId}`);
                if (res.success) { alert(res.message); fetchDashboard(); }
            } catch (err) { alert("Lỗi khi xóa sản phẩm!"); }
        }
    };

    const handleDeleteCategory = async (catId, catName) => {
        if (window.confirm(`Xóa danh mục ${catName} có thể làm mất sản phẩm bên trong, bạn chắc chưa?`)) {
            try {
                const { data: res } = await API.delete(`/admin/category/${catId}`);
                if (res.success) { alert(res.message); fetchDashboard(); }
            } catch (err) { alert(err.response?.data?.message || "Lỗi khi xóa danh mục!"); }
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    // ================= CÁC BIẾN DỮ LIỆU ĐÃ ĐƯỢC LỌC =================
    // Lọc Đơn Hàng
    const filteredOrders = data?.orders?.filter(order => {
        const searchStr = orderSearch.toLowerCase();
        const matchNameOrId = order.shippingInfo?.fullName?.toLowerCase().includes(searchStr) || order._id.toLowerCase().includes(searchStr);
        const matchStatus = orderStatus === 'all' ? true : (orderStatus === 'shipped' ? order.isShipped : !order.isShipped);
        const matchDate = orderDate ? (order.createdAt && order.createdAt.substring(0, 10) === orderDate) : true;
        return matchNameOrId && matchStatus && matchDate;
    }) || [];

    // Lọc Sản Phẩm
    const filteredProducts = data?.products?.filter(product => {
        const matchName = product.name.toLowerCase().includes(productSearch.toLowerCase());
        const matchCat = productCategory === 'all' ? true : product.category?._id === productCategory;
        return matchName && matchCat;
    }) || [];

    // Lọc Danh Mục
    const filteredCategories = data?.categories?.filter(cat => {
        return cat.name.toLowerCase().includes(categorySearch.toLowerCase());
    }) || [];
    // ================================================================

    const barChartData = data ? {
        labels: data.daysList || [],
        datasets: [{ label: 'Doanh thu (₫)', data: data.revenuesList || [], backgroundColor: 'rgba(25, 135, 84, 0.7)', borderColor: '#198754', borderWidth: 2, borderRadius: 5 }]
    } : null;

    const doughnutChartData = data ? {
        labels: ['Đã giao', 'Chờ xử lý'],
        datasets: [{ data: [data.shippedCount || 0, data.pendingCount || 0], backgroundColor: ['#198754', '#ffc107'] }]
    } : null;

    if (loading) return <div className="text-center mt-5 mb-5"><h3>Đang tải Dashboard...</h3></div>;
    if (!data) return <div className="text-center mt-5 mb-5"><h3>Không có dữ liệu!</h3></div>;

    return (
        <>
            <style>
                {`
                    .nav-pills .nav-link { color: #6c757d; font-weight: 500; border-radius: 12px; cursor: pointer; transition: 0.3s; border: none; background: transparent; }
                    .nav-pills .nav-link.active { background-color: #198754; color: white; }
                    .nav-pills .nav-link:hover:not(.active) { background-color: #f8f9fa; color: #198754; }
                    .sticky-top { z-index: 1020; top: 20px; }
                    .img-product-admin { width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
                `}
            </style>

            <div className="container-fluid mt-4 mb-5">
                <div className="row">
                    {/* MENUBAR BÊN TRÁI */}
                    <div className="col-md-2 mb-4">
                        <div className="card border-0 shadow-sm rounded-4 p-3 sticky-top">
                            <h6 className="fw-bold text-secondary mb-3 small text-uppercase">Điều khiển</h6>
                            <div className="nav flex-column nav-pills">
                                <button className={`nav-link mb-2 text-start ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><i className="bi bi-graph-up me-2"></i>Tổng quan</button>
                                <button className={`nav-link mb-2 text-start ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><i className="bi bi-cart3 me-2"></i>Đơn hàng</button>
                                <button className={`nav-link mb-2 text-start ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><i className="bi bi-box-seam me-2"></i>Sản phẩm</button>
                                <button className={`nav-link mb-2 text-start ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}><i className="bi bi-tags me-2"></i>Danh mục</button>
                                <hr />
                                <Link to="/admin/product/add" className="btn btn-success rounded-pill btn-sm mb-2"><i className="bi bi-plus-circle me-1"></i> Thêm SP</Link>
                                <button onClick={handleExportExcel} disabled={isExporting} className="btn btn-outline-success rounded-pill btn-sm mb-2">
                                    {isExporting ? <><span className="spinner-border spinner-border-sm me-1"></span> Đang tải...</> : <><i className="bi bi-file-earmark-excel me-1"></i> Xuất Excel</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-10">
                        <div className="tab-content">
                            
                            {/* TAB TỔNG QUAN */}
                            {activeTab === 'overview' && (
                                <div className="tab-pane show active">
                                    <h2 className="fw-bold text-success mb-4 text-uppercase">Hệ thống quản trị NNIT</h2>
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

                            {/* TAB ĐƠN HÀNG CÓ BỘ LỌC */}
                            {activeTab === 'orders' && (
                                <div className="tab-pane show active">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="card-header bg-white py-3">
                                            <h5 className="fw-bold mb-3">Quản Lý Đơn Hàng</h5>
                                            
                                            {/* THANH CÔNG CỤ LỌC ĐƠN HÀNG */}
                                            <div className="row g-2">
                                                <div className="col-md-4">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                        <input type="text" className="form-control rounded-end-pill" placeholder="Tên khách hàng hoặc Mã đơn..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <select className="form-select form-select-sm rounded-pill" value={orderStatus} onChange={e => setOrderStatus(e.target.value)}>
                                                        <option value="all">Tất cả trạng thái</option>
                                                        <option value="pending">Chờ xử lý</option>
                                                        <option value="shipped">Đã giao hàng</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <input type="date" className="form-control form-control-sm rounded-pill" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                                                </div>
                                                <div className="col-md-2">
                                                    <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => {setOrderSearch(''); setOrderStatus('all'); setOrderDate('');}}>Xóa lọc</button>
                                                </div>
                                            </div>

                                        </div>
                                        {/* Đã thêm overflowY: 'auto' */}
                                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table className="table table-hover align-middle mb-0">
                                                {/* Đã xóa sticky-top của Bootstrap, tự custom lại position và z-index */}
                                                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                                    <tr><th>Mã đơn</th><th>Khách hàng</th><th>Tiền</th><th>Trạng thái</th><th>Hành động</th></tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
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
                                    </div>
                                </div>
                            )}

                            {/* TAB SẢN PHẨM CÓ BỘ LỌC */}
                            {activeTab === 'products' && (
                                <div className="tab-pane show active">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="card-header bg-white py-3">
                                            <h5 className="fw-bold mb-3">Kho Sản Phẩm</h5>
                                            
                                            {/* THANH CÔNG CỤ LỌC SẢN PHẨM */}
                                            <div className="row g-2">
                                                <div className="col-md-5">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                        <input type="text" className="form-control rounded-end-pill" placeholder="Tìm kiếm theo tên sản phẩm..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <select className="form-select form-select-sm rounded-pill" value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                                                        <option value="all">Tất cả danh mục</option>
                                                        {data.categories?.map(cat => (
                                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-3">
                                                    <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => {setProductSearch(''); setProductCategory('all');}}>Xóa lọc</button>
                                                </div>
                                            </div>

                                        </div>
                                        {/* Đã thêm overflowY: 'auto' */}
                                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table className="table table-hover align-middle mb-0">
                                                {/* Đã xóa sticky-top của Bootstrap, tự custom lại position và z-index */}
                                                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                                    <tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Hành động</th></tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProducts.length > 0 ? filteredProducts.map(product => (
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
                                    </div>
                                </div>
                            )}

                            {/* TAB DANH MỤC CÓ BỘ LỌC */}
                            {activeTab === 'categories' && (
                                <div className="tab-pane show active">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                        <div className="card-header bg-white py-3">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="fw-bold mb-0">Quản Lý Danh Mục</h5>
                                                <Link to="/admin/category/add" className="btn btn-sm btn-success rounded-pill px-3"><i className="bi bi-plus"></i> Thêm mới</Link>
                                            </div>

                                            {/* THANH CÔNG CỤ TÌM DANH MỤC */}
                                            <div className="row g-2">
                                                <div className="col-md-9">
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span>
                                                        <input type="text" className="form-control rounded-end-pill" placeholder="Tìm tên danh mục (VD: iPhone, Samsung...)" value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <button className="btn btn-sm btn-outline-secondary w-100 rounded-pill" onClick={() => setCategorySearch('')}>Xóa lọc</button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Đã thêm overflowY: 'auto' */}
                                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table className="table table-hover align-middle mb-0">
                                                {/* Đã xóa sticky-top của Bootstrap, tự custom lại position và z-index */}
                                                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                                    <tr><th className="ps-4">ID</th><th>Tên danh mục</th><th>Số sản phẩm</th><th>Hành động</th></tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCategories.length > 0 ? filteredCategories.map(cat => (
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboardPage;