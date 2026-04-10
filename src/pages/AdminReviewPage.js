import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

const AdminReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States cho bộ lọc
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Lấy danh mục để bỏ vào dropdown lọc
            const catRes = await API.get('/products/categories');
            if (catRes.data.success) setCategories(catRes.data.categories);

            // Lấy danh sách review kèm filter
            const res = await API.get(`/admin/reviews`, {
                params: { page, search, category: selectedCategory }
            });
            if (res.data.success) {
                setReviews(res.data.reviews);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, selectedCategory]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setPage(1);
            fetchData();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Nhớ chắc chắn muốn xóa đánh giá này chứ?")) {
            try {
                await API.delete(`/admin/review/${id}`);
                fetchData(); // Tải lại dữ liệu
            } catch (error) {
                alert("Lỗi khi xóa!");
            }
        }
    };

    return (
        <div className="p-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-success mb-0">QUẢN LÝ ĐÁNH GIÁ</h3>
                </div>

                {/* THANH CÔNG CỤ LỌC & TÌM KIẾM */}
                <div className="row g-3 mb-4">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 shadow-none" 
                                placeholder="Tìm theo tên SP, nội dung hoặc khách hàng..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <select 
                            className="form-select shadow-none"
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3">
                        <button className="btn btn-outline-secondary w-100 rounded-pill" onClick={() => { setSearch(''); setSelectedCategory(''); setPage(1); }}>
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Khách hàng</th>
                                <th className="text-center">Số sao</th>
                                <th>Nội dung bình luận</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5">Đang tải dữ liệu...</td></tr>
                            ) : reviews.length > 0 ? reviews.map(rv => (
                                <tr key={rv._id}>
                                    <td>
                                        <div className="fw-bold text-dark">{rv.productInfo?.name}</div>
                                        <small className="text-muted">ID: #{rv._id.substring(18, 24).toUpperCase()}</small>
                                    </td>
                                    <td>
                                        <div className="fw-bold">{rv.name}</div>
                                        <small className="text-muted">{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-warning text-dark px-3 rounded-pill">
                                            {rv.rating} <i className="bi bi-star-fill small"></i>
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                        <p className="mb-0 text-truncate" title={rv.content}>{rv.content}</p>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Link to={`/product/${rv.productInfo?._id}`} target="_blank" className="btn btn-sm btn-outline-primary rounded-circle">
                                                <i className="bi bi-eye"></i>
                                            </Link>
                                            <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(rv._id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy đánh giá nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PHÂN TRANG */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <ul className="pagination pagination-sm shadow-sm rounded-pill overflow-hidden">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page - 1)}>Trước</button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setPage(page + 1)}>Sau</button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewPage;