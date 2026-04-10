import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = "http://localhost:5000";

const AdminReviewPage = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reviewDate, setReviewDate] = useState(''); 
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catRes = await API.get('/admin/dashboard'); 
                if (catRes.data && catRes.data.success) {
                    setCategories(catRes.data.categories);
                }
            } catch (error) {
                console.log("Cảnh báo: Không tải được danh mục.");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/admin/reviews`, {
                    params: { page, search, category: selectedCategory, date: reviewDate }
                });
                if (res.data && res.data.success) {
                    setReviews(res.data.reviews);
                    setTotalPages(res.data.totalPages);
                }
            } catch (error) {
                console.error("Lỗi tải đánh giá:", error);
            } finally {
                setLoading(false);
            }
        };

        const delaySearch = setTimeout(() => {
            fetchReviews();
        }, 400);

        return () => clearTimeout(delaySearch);
    }, [page, search, selectedCategory, reviewDate]);

    const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
    const handleCategoryChange = (e) => { setSelectedCategory(e.target.value); setPage(1); };
    const handleDateChange = (e) => { setReviewDate(e.target.value); setPage(1); };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này chứ?")) {
            try {
                const res = await API.delete(`/admin/review/${id}`);
                if (res.data && res.data.success) {
                    alert("Đã xóa thành công!");
                    setReviews(reviews.filter(rv => rv._id !== id));
                }
            } catch (error) {
                alert("Lỗi khi xóa!");
            }
        }
    };

    return (
        <div className="admin-fullscreen-layout">
            <style>
                {`
                    .admin-fullscreen-layout { display: flex; height: 100vh; width: 100vw; position: fixed; top: 0; left: 0; background: #f4f6f9; z-index: 9999; }
                    .admin-sidebar { width: 260px; background: #fff; border-right: 1px solid #eee; display: flex; flex-direction: column; flex-shrink: 0; }
                    .admin-main { flex-grow: 1; overflow-y: auto; padding: 30px; }
                    .nav-link { color: #495057; font-weight: 500; padding: 12px 20px; border-radius: 10px; margin-bottom: 5px; border: none; background: none; text-align: left; width: 100%; cursor: pointer; text-decoration: none; display: block; }
                    .nav-link.active { background-color: #198754; color: white; }
                    .nav-link:hover:not(.active) { background-color: #e9ecef; }
                    .btn-action-circle { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; padding: 0 !important; }
                    .img-review-sp { width: 40px; height: 40px; object-fit: contain; border-radius: 5px; background: #fff; border: 1px solid #eee; }
                `}
            </style>

            <div className="admin-sidebar p-3">
                <div className="text-center mb-4 border-bottom pb-3 mt-2">
                    <h4 className="fw-bold text-success mb-0"><i className="bi bi-shield-lock-fill me-2"></i>NNIT ADMIN</h4>
                    <small className="text-muted text-uppercase small" style={{fontSize:'10px'}}>Quản lý hệ thống</small>
                </div>
                <div className="nav flex-column">
                    <button className="nav-link text-start" onClick={() => navigate('/admin')}><i className="bi bi-graph-up me-2"></i> Dashboard</button>
                    <button className="nav-link active text-start"><i className="bi bi-chat-left-text me-2"></i> Đánh giá</button>
                    <hr />
                </div>
                <Link to="/" className="mt-auto btn btn-outline-dark rounded-pill fw-bold small">Về Trang Chủ</Link>
            </div>

            <div className="admin-main">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                    <h3 className="fw-bold text-success mb-4">QUẢN LÝ ĐÁNH GIÁ</h3>

                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0 shadow-none py-2" placeholder="Tìm tên SP, nội dung, khách..." value={search} onChange={handleSearchChange} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <select className="form-select shadow-none py-2" value={selectedCategory} onChange={handleCategoryChange}>
                                <option value="">--- Tất cả danh mục ---</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control shadow-none py-2 text-muted" value={reviewDate} onChange={handleDateChange} />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-secondary w-100 py-2 rounded-3 fw-bold" onClick={() => { setSearch(''); setSelectedCategory(''); setReviewDate(''); setPage(1); }}>Làm mới</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="text-start ps-3">Sản phẩm</th>
                                    <th>Khách hàng</th>
                                    <th>Số sao</th>
                                    <th>Nội dung bình luận</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-5 fw-bold text-success">Đang tải dữ liệu...</td></tr>
                                ) : reviews.length > 0 ? reviews.map(rv => (
                                    <tr key={rv._id} className="text-center">
                                        <td className="text-start ps-3">
                                            <div className="d-flex align-items-center">
                                                <img src={`${BACKEND_URL}/${rv.productInfo?.image}`} className="img-review-sp me-2 shadow-sm" alt="p" onError={(e) => e.target.src = "https://via.placeholder.com/40"} />
                                                <div style={{maxWidth:'180px'}} className="text-truncate fw-bold">{rv.productInfo?.name || "Sản phẩm đã xóa"}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold">{rv.name}</div>
                                            <small className="text-muted" style={{fontSize:'10px'}}>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small>
                                        </td>
                                        <td>
                                            <span className="text-warning fw-bold">{rv.rating} <i className="bi bi-star-fill small"></i></span>
                                        </td>
                                        <td>
                                            <div className="p-2 bg-light rounded-3 border" style={{ maxWidth: '300px', margin: '0 auto' }}>
                                                <p className="mb-0 small text-muted text-truncate" title={rv.content}>{rv.content}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                {/* LINK TỚI TRANG SẢN PHẨM KÈM THEO ID BÌNH LUẬN */}
                                                {rv.productInfo?._id ? (
                                                    <Link to={`/product/${rv.productInfo._id}#review-${rv._id}`} target="_blank" className="btn btn-sm btn-outline-primary rounded-circle rounded-circle-icon shadow-sm" title="Đi tới bình luận"><i className="bi bi-eye"></i></Link>
                                                ) : (
                                                    <button className="btn btn-sm btn-outline-secondary rounded-circle rounded-circle-icon shadow-sm disabled"><i className="bi bi-eye-slash"></i></button>
                                                )}
                                                <button className="btn btn-sm btn-outline-danger rounded-circle rounded-circle-icon shadow-sm" onClick={() => handleDelete(rv._id)} title="Xóa bình luận"><i className="bi bi-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">Không tìm thấy đánh giá nào khớp với bộ lọc.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <ul className="pagination pagination-sm shadow-sm rounded-pill overflow-hidden">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link text-success fw-bold" onClick={() => setPage(page - 1)}>Trước</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link fw-bold" onClick={() => setPage(i + 1)} style={page === i + 1 ? { backgroundColor: '#198754', borderColor: '#198754', color: 'white' } : { color: '#198754' }}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link text-success fw-bold" onClick={() => setPage(page + 1)}>Sau</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReviewPage;