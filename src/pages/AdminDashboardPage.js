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

    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('all');
    const [orderDate, setOrderDate] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('all');
    const [categorySearch, setCategorySearch] = useState('');
    const [reviewSearch, setReviewSearch] = useState('');
    const [reviewCategory, setReviewCategory] = useState('all');
    const [reviewDate, setReviewDate] = useState(''); 

    const [pageOrders, setPageOrders] = useState(1);
    const [pageProducts, setPageProducts] = useState(1);
    const [pageCategories, setPageCategories] = useState(1);
    const [pageReviews, setPageReviews] = useState(1);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get('/admin/dashboard', {
                    params: {
                        orderPage: pageOrders, orderSearch, orderStatus, orderDate,
                        productPage: pageProducts, productSearch, productCategory,
                        categoryPage: pageCategories, categorySearch,
                        reviewPage: pageReviews, reviewSearch, reviewCategory, reviewDate
                    }
                });
                if (response.data && response.data.success) setData(response.data);
                setLoading(false);
            } catch (error) { setLoading(false); }
        };
        const timer = setTimeout(() => { if (!user || !user.isAdmin) navigate('/'); else fetchDashboard(); }, 500);
        return () => clearTimeout(timer);
    }, [pageOrders, orderSearch, orderStatus, orderDate, pageProducts, productSearch, productCategory, pageCategories, categorySearch, pageReviews, reviewSearch, reviewCategory, reviewDate, user, navigate]);

    const refreshData = async () => {
        try {
            const response = await API.get('/admin/dashboard', {
                params: { orderPage: pageOrders, orderSearch, orderStatus, orderDate, productPage: pageProducts, productSearch, productCategory, categoryPage: pageCategories, categorySearch, reviewPage: pageReviews, reviewSearch, reviewCategory, reviewDate }
            });
            if (response.data?.success) setData(response.data);
        } catch (error) {}
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const response = await API.get('/admin/export-excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a'); link.href = url; link.setAttribute('download', 'BaoCao_DoanhThu_NNITShop.xlsx');
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
        } catch (error) { alert("Lỗi khi xuất file Excel!"); } finally { setIsExporting(false); }
    };

    const handleShipOrder = async (id) => { try { const { data: res } = await API.put(`/admin/order/${id}/ship`); if (res.success) { alert(res.message); refreshData(); } } catch (err) { alert("Lỗi xác nhận!"); } };
    const handleDeleteOrder = async (id) => { if (window.confirm("Xóa đơn hàng này?")) { try { const { data: res } = await API.delete(`/admin/order/${id}`); if (res.success) { alert(res.message); refreshData(); } } catch (err) { alert("Lỗi xóa đơn!"); } } };
    const handleDeleteProduct = async (id, name) => { if (window.confirm(`Xóa sản phẩm ${name}?`)) { try { const { data: res } = await API.delete(`/admin/product/${id}`); if (res.success) { alert(res.message); refreshData(); } } catch (err) { alert("Lỗi xóa SP!"); } } };
    const handleDeleteCategory = async (id, name) => { if (window.confirm(`Xóa danh mục ${name}?`)) { try { const { data: res } = await API.delete(`/admin/category/${id}`); if (res.success) { alert(res.message); refreshData(); } } catch (err) { alert(err.response?.data?.message || "Lỗi xóa danh mục!"); } } };
    const handleDeleteReview = async (id) => { if (window.confirm("Xóa vĩnh viễn đánh giá này?")) { try { const { data: res } = await API.delete(`/admin/review/${id}`); if (res.success) { alert("Đã xóa!"); refreshData(); } } catch (err) { alert("Lỗi xóa!"); } } };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    const renderPagination = (totalItems, currentPage, setCurrentPage) => {
        const safeTotal = Number(totalItems) || 0;
        const totalPages = Math.max(1, Math.ceil(safeTotal / 10));
        if (totalPages <= 1) return null;
        return (
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top px-3">
                <span className="small text-muted fw-bold">Trang {currentPage} / {totalPages} (Tổng: {safeTotal})</span>
                <ul className="pagination pagination-sm mb-0 shadow-sm">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link text-success" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Trước</button></li>
                    {[...Array(totalPages)].map((_, i) => (<li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => setCurrentPage(i + 1)} style={currentPage === i + 1 ? { backgroundColor: '#198754', color: 'white' } : { color: '#198754' }}>{i + 1}</button></li>))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button className="page-link text-success" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>Sau</button></li>
                </ul>
            </div>
        );
    };

    const barChartData = data?.daysList ? { labels: data.daysList, datasets: [{ label: 'Doanh thu (₫)', data: data.revenuesList || [], backgroundColor: 'rgba(25, 135, 84, 0.7)' }] } : { labels: [], datasets: [] };
    const doughnutChartData = data ? { labels: ['Đã giao', 'Chờ xử lý'], datasets: [{ data: [data.shippedCount || 0, data.pendingCount || 0], backgroundColor: ['#198754', '#ffc107'] }] } : { labels: [], datasets: [] };

    if (loading) return <div className="text-center mt-5"><h3>Đang tải Dashboard...</h3></div>;
    if (!data) return <div className="text-center mt-5 text-danger"><h3>Lỗi: Không lấy được dữ liệu từ API!</h3></div>;

    return (
        <div className="admin-fullscreen-layout">
            <style>{`.admin-fullscreen-layout{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#f4f6f9;z-index:9999;display:flex;overflow:hidden}.admin-sidebar{width:260px;background-color:#fff;height:100vh;box-shadow:2px 0 15px rgba(0,0,0,0.05);display:flex;flex-direction:column;flex-shrink:0;z-index:100}.admin-main{flex-grow:1;height:100vh;overflow-y:auto;padding:30px}.admin-main::-webkit-scrollbar,.table-scroll-container::-webkit-scrollbar{width:6px;height:6px}.admin-main::-webkit-scrollbar-thumb,.table-scroll-container::-webkit-scrollbar-thumb{background-color:#198754;border-radius:10px}.admin-main::-webkit-scrollbar-track,.table-scroll-container::-webkit-scrollbar-track{background-color:#e9ecef}.admin-sidebar .nav-pills .nav-link{color:#495057;font-weight:500;border-radius:10px;padding:12px 20px;margin-bottom:8px;border:none;background:transparent;text-align:left}.admin-sidebar .nav-pills .nav-link.active{background-color:#198754;color:white;box-shadow:0 4px 10px rgba(25,135,84,0.3)}.img-product-admin{width:45px;height:45px;object-fit:contain;border-radius:8px;border:1px solid #eee;background:white}.table-scroll-container{max-height:calc(100vh - 250px);overflow-y:auto}.rounded-circle-icon{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;padding:0 !important}`}</style>
            
            <div className="admin-sidebar p-3">
                <div className="text-center mb-4 mt-2 pb-3 border-bottom"><h4 className="fw-bold text-success mb-0">NNIT ADMIN</h4></div>
                <div className="nav flex-column nav-pills flex-grow-1 overflow-y-auto">
                    <button className={`nav-link text-start ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}><i className="bi bi-graph-up me-2"></i>Tổng quan</button>
                    <button className={`nav-link text-start ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}><i className="bi bi-cart3 me-2"></i>Đơn hàng</button>
                    <button className={`nav-link text-start ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')}><i className="bi bi-box-seam me-2"></i>Sản phẩm</button>
                    <button className={`nav-link text-start ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleTabChange('categories')}><i className="bi bi-tags me-2"></i>Danh mục</button>
                    <button className={`nav-link text-start ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}><i className="bi bi-chat-left-dots me-2"></i>Đánh giá</button>
                    <hr className="my-3"/>
                    <Link to="/admin/product/add" className="btn btn-success rounded-pill btn-sm mb-2 py-2 fw-bold"><i className="bi bi-plus-circle me-1"></i> Thêm SP</Link>
                    <button onClick={handleExportExcel} disabled={isExporting} className="btn btn-outline-success rounded-pill btn-sm mb-2 py-2 fw-bold">{isExporting ? 'Đang tải...' : 'Xuất Excel'}</button>
                </div>
                <div className="mt-auto pt-3 border-top"><Link to="/" className="btn btn-outline-dark w-100 rounded-pill fw-bold">Về Trang Chủ</Link></div>
            </div>

            <div className="admin-main">
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <h2 className="fw-bold text-success mb-4">TỔNG QUAN HỆ THỐNG</h2>
                            <div className="row g-3 mb-4">
                                <div className="col-md-3"><div className="card border-0 shadow-sm bg-success text-white p-3 rounded-4"><small className="fw-bold">Doanh Thu</small><h4 className="fw-bold mb-0">{formatPrice(data.totalRevenue)} ₫</h4></div></div>
                                <div className="col-md-3"><div className="card border-0 shadow-sm bg-primary text-white p-3 rounded-4"><small className="fw-bold">Đơn Hàng</small><h4 className="fw-bold mb-0">{data.totalOrders || 0}</h4></div></div>
                                <div className="col-md-3"><div className="card border-0 shadow-sm bg-warning text-dark p-3 rounded-4"><small className="fw-bold">Chờ Xử Lý</small><h4 className="fw-bold mb-0">{data.pendingCount || 0}</h4></div></div>
                                <div className="col-md-3"><div className="card border-0 shadow-sm bg-info text-white p-3 rounded-4"><small className="fw-bold">Đánh giá mới</small><h4 className="fw-bold mb-0">{data.totalReviewsCountAll || 0}</h4></div></div>
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-md-8"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white" style={{ height: '400px' }}><Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div></div>
                                <div className="col-md-4"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white" style={{ height: '400px' }}><Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} /></div></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-3 text-success">Quản Lý Đơn Hàng</h5>
                                    <div className="row g-2">
                                        <div className="col-md-4"><div className="input-group input-group-sm"><span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span><input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm khách hàng/Mã đơn..." value={orderSearch} onChange={e => {setOrderSearch(e.target.value); setPageOrders(1);}} /></div></div>
                                        <div className="col-md-3"><select className="form-select form-select-sm rounded-pill shadow-none" value={orderStatus} onChange={e => {setOrderStatus(e.target.value); setPageOrders(1);}}><option value="all">Tất cả</option><option value="pending">Chờ xử lý</option><option value="shipped">Đã giao</option></select></div>
                                        <div className="col-md-3"><input type="date" className="form-control form-control-sm rounded-pill shadow-none" value={orderDate} onChange={e => {setOrderDate(e.target.value); setPageOrders(1);}} /></div>
                                        <div className="col-md-2"><button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setOrderSearch(''); setOrderStatus('all'); setOrderDate(''); setPageOrders(1);}}>Làm mới</button></div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0 text-center">
                                        <thead className="table-light sticky-top"><tr><th>Mã đơn</th><th>Khách hàng</th><th>Tiền</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                                        <tbody>
                                            {Array.isArray(data.orders) && data.orders.length > 0 ? data.orders.map(order => (
                                                <tr key={order._id}>
                                                    <td className="text-primary fw-bold">#{String(order._id).substring(18, 24).toUpperCase()}</td>
                                                    <td>{order.shippingInfo?.fullName}</td>
                                                    <td className="text-danger fw-bold">{formatPrice(order.amountPaid)} ₫</td>
                                                    <td>{order.isShipped ? <span className="badge rounded-pill bg-success">Đã giao</span> : <span className="badge rounded-pill bg-warning text-dark">Chờ xử lý</span>}</td>
                                                    <td><div className="d-flex justify-content-center gap-2">{!order.isShipped && (<button className="btn btn-sm btn-success rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleShipOrder(order._id)}><i className="bi bi-check-lg"></i></button>)}<Link to={`/admin/order/edit/${order._id}`} className="btn btn-sm btn-outline-primary rounded-circle rounded-circle-icon shadow-sm"><i className="bi bi-pencil"></i></Link><button className="btn btn-sm btn-outline-danger rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleDeleteOrder(order._id)}><i className="bi bi-trash"></i></button></div></td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="py-4 text-muted italic">Trống!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalOrdersCount, pageOrders, setPageOrders)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3">
                                    <h5 className="fw-bold mb-3 text-success">Quản Lý Sản Phẩm</h5>
                                    <div className="row g-2">
                                        <div className="col-md-5"><div className="input-group input-group-sm"><span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span><input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm sản phẩm..." value={productSearch} onChange={e => {setProductSearch(e.target.value); setPageProducts(1);}} /></div></div>
                                        <div className="col-md-4"><select className="form-select form-select-sm rounded-pill shadow-none" value={productCategory} onChange={e => {setProductCategory(e.target.value); setPageProducts(1);}}><option value="all">Tất cả danh mục</option>{Array.isArray(data.categories) && data.categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}</select></div>
                                        <div className="col-md-3 text-end"><button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setProductSearch(''); setProductCategory('all'); setPageProducts(1);}}>Làm mới</button></div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light sticky-top"><tr><th className="ps-4">Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th className="text-center">Hành động</th></tr></thead>
                                        <tbody>
                                            {Array.isArray(data.products) && data.products.length > 0 ? data.products.map(product => (
                                                <tr key={product._id}>
                                                    <td className="ps-4"><img src={`${BACKEND_URL}/${product.image}`} className="img-product-admin shadow-sm" alt="p" onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }}/></td>
                                                    <td className="fw-bold">{product.name}</td>
                                                    <td><span className="badge bg-light text-dark border px-3">{product.category?.name}</span></td>
                                                    <td className="text-center"><div className="d-flex justify-content-center gap-2"><Link to={`/admin/product/edit/${product._id}`} className="btn btn-sm btn-outline-primary rounded-circle rounded-circle-icon shadow-sm"><i className="bi bi-pencil-fill"></i></Link><button className="btn btn-sm btn-outline-danger rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleDeleteProduct(product._id, product.name)}><i className="bi bi-trash-fill"></i></button></div></td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">Trống!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalProductsCount, pageProducts, setPageProducts)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold mb-0 text-success">Quản Lý Danh Mục</h5><Link to="/admin/category/add" className="btn btn-sm btn-success rounded-pill px-4 fw-bold shadow-sm"><i className="bi bi-plus-lg me-1"></i> Thêm mới</Link></div>
                                    <div className="row"><div className="col-md-12"><input type="text" className="form-control form-control-sm rounded-pill px-4 shadow-none" placeholder="Tìm tên danh mục..." value={categorySearch} onChange={e => {setCategorySearch(e.target.value); setPageCategories(1);}} /></div></div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light sticky-top"><tr><th className="ps-4">ID Loại</th><th>Tên danh mục</th><th className="text-center">Số SP</th><th className="text-center">Hành động</th></tr></thead>
                                        <tbody>
                                            {Array.isArray(data.categories) && data.categories.length > 0 ? data.categories.map(cat => (
                                                <tr key={cat._id}>
                                                    <td className="ps-4 text-secondary small">#{String(cat._id).substring(18, 24).toUpperCase()}</td>
                                                    <td className="fw-bold">{cat.name}</td>
                                                    <td className="text-center"><span className="badge rounded-pill bg-light text-primary px-3">{cat.productCount || 0} sản phẩm</span></td> 
                                                    <td><div className="d-flex justify-content-center gap-2"><Link to={`/admin/category/edit/${cat._id}`} className="btn btn-sm btn-outline-primary rounded-circle rounded-circle-icon shadow-sm"><i className="bi bi-pencil-square"></i></Link><button className="btn btn-sm btn-outline-danger rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleDeleteCategory(cat._id, cat.name)}><i className="bi bi-trash"></i></button></div></td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="text-center py-5 text-muted">Trống!</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                {renderPagination(data.totalCategoriesCount, pageCategories, setPageCategories)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="tab-pane show active animate__animated animate__fadeIn">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden pb-2 bg-white">
                                <div className="card-header bg-white py-3 border-bottom">
                                    <h5 className="fw-bold mb-3 text-success">Kiểm Duyệt Đánh Giá</h5>
                                    <div className="row g-2">
                                        <div className="col-md-4"><div className="input-group input-group-sm"><span className="input-group-text bg-white rounded-start-pill"><i className="bi bi-search"></i></span><input type="text" className="form-control rounded-end-pill shadow-none" placeholder="Tìm tên SP, khách, bình luận..." value={reviewSearch} onChange={e => {setReviewSearch(e.target.value); setPageReviews(1);}} /></div></div>
                                        <div className="col-md-3"><select className="form-select form-select-sm rounded-pill shadow-none" value={reviewCategory} onChange={e => {setReviewCategory(e.target.value); setPageReviews(1);}}><option value="all">Tất cả loại máy</option>{Array.isArray(data.categories) && data.categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div>
                                        <div className="col-md-3"><input type="date" className="form-control form-control-sm rounded-pill shadow-none text-muted" value={reviewDate} onChange={e => {setReviewDate(e.target.value); setPageReviews(1);}} /></div>
                                        <div className="col-md-2"><button className="btn btn-sm btn-outline-secondary w-100 rounded-pill fw-bold" onClick={() => {setReviewSearch(''); setReviewCategory('all'); setReviewDate(''); setPageReviews(1);}}>Làm mới</button></div>
                                    </div>
                                </div>
                                <div className="table-responsive table-scroll-container">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light sticky-top"><tr><th className="ps-4 text-start">Sản phẩm</th><th>Khách hàng</th><th className="text-center">Số sao</th><th>Nội dung bình luận</th><th className="text-center">Hành động</th></tr></thead>
                                        <tbody>
                                            {Array.isArray(data.reviews) && data.reviews.length > 0 ? data.reviews.map(rv => (
                                                <tr key={rv._id}>
                                                    <td className="ps-4 text-start"><div className="d-flex align-items-center"><img src={`${BACKEND_URL}/${rv.product?.image}`} className="img-product-admin me-2 shadow-sm" alt="p" onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }}/><small className="fw-bold text-truncate" style={{maxWidth: '120px'}}>{rv.product?.name || "SP đã xóa"}</small></div></td>
                                                    <td><div className="fw-bold">{rv.name}</div><small className="text-muted" style={{fontSize: '10px'}}>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small></td>
                                                    <td className="text-center"><span className="text-warning fw-bold">{rv.rating} <i className="bi bi-star-fill"></i></span></td>
                                                    <td><p className="mb-0 small text-muted text-truncate" style={{maxWidth: '300px'}} title={rv.content}>{rv.content}</p></td>
                                                    <td className="text-center"><div className="d-flex justify-content-center gap-2">{rv.product?._id ? (<Link to={`/product/${rv.product._id}#review-${rv._id}`} target="_blank" className="btn btn-sm btn-outline-primary rounded-circle rounded-circle-icon shadow-sm" title="Đi tới bình luận"><i className="bi bi-eye"></i></Link>) : (<button className="btn btn-sm btn-outline-secondary rounded-circle rounded-circle-icon shadow-sm disabled"><i className="bi bi-eye-slash"></i></button>)}<button className="btn btn-sm btn-outline-danger rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleDeleteReview(rv._id)} title="Xóa bình luận"><i className="bi bi-trash"></i></button></div></td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="text-center py-5 text-muted">Trống!</td></tr>}
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