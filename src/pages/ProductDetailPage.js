import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api'; 
import './ProductDetail.css';

const BACKEND_URL = "http://localhost:5000";

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0} });
    const [loading, setLoading] = useState(true);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    
    // States cho việc gửi đánh giá mới
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    
    // States cho việc phản hồi (Admin)
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    // States cho việc chỉnh sửa đánh giá (User)
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editContent, setEditContent] = useState('');

    const fetchProductDetail = async () => {
        try {
            const { data } = await API.get(`/products/${id}`);
            if (data.success) {
                setProduct(data.product);
                setRelatedProducts(data.relatedProducts);
                setReviews(data.reviews || []); 
                setStats(data.ratingStats || { average: 0, total: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0} });
                
                if (data.product.variants && data.product.variants.length > 0 && !selectedVariant) {
                    setSelectedVariant(data.product.variants[0]);
                }
            }
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy chi tiết sản phẩm:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProductDetail();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (selectedVariant && quantity > selectedVariant.stock) {
            setQuantity(selectedVariant.stock === 0 ? 0 : 1);
        }
    }, [selectedVariant]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    const handleAddToCart = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để mua hàng!");
            navigate('/login');
            return;
        }
        if (quantity > selectedVariant.stock) {
            alert(`Số lượng vượt quá tồn kho (Chỉ còn ${selectedVariant.stock} sản phẩm).`);
            return;
        }
        try {
            const response = await API.post('/cart/add', { 
                productId: product._id,
                variantId: selectedVariant._id, 
                quantity: quantity 
            });
            if (response.data.success) {
                window.dispatchEvent(new Event('cartUpdated')); 
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm vào giỏ hàng!");
        }
    };

    // Gửi đánh giá mới
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/products/${id}/reviews`, { 
                rating: reviewRating, 
                content: reviewContent 
            });
            alert("Cảm ơn bài đánh giá của Nhớ!");
            setReviewContent('');
            setReviewRating(5);
            fetchProductDetail(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
        }
    };

    // Sửa đánh giá
    const handleEditSubmit = async (reviewId) => {
        try {
            const { data } = await API.put(`/products/reviews/${reviewId}`, { 
                rating: editRating, 
                content: editContent 
            });
            if (data.success) {
                setEditingReviewId(null);
                fetchProductDetail();
            }
        } catch (error) {
            alert("Lỗi khi cập nhật đánh giá!");
        }
    };

    // Xóa đánh giá
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Nhớ chắc chắn muốn xóa đánh giá này chứ?")) {
            try {
                const { data } = await API.delete(`/products/reviews/${reviewId}`);
                if (data.success) {
                    fetchProductDetail();
                }
            } catch (error) {
                alert("Lỗi khi xóa đánh giá!");
            }
        }
    };

    // Admin phản hồi
    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) return;
        try {
            await API.post(`/products/reviews/${reviewId}/reply`, { 
                content: replyContent 
            });
            setReplyingTo(null);
            setReplyContent('');
            fetchProductDetail(); 
        } catch (error) {
            alert("Lỗi khi gửi phản hồi!");
        }
    };

    if (loading) return <div className="text-center mt-5 mb-5"><h3 className="text-success">Đang tải dữ liệu từ Server...</h3></div>;
    if (!product || !selectedVariant) return <div className="text-center mt-5 mb-5"><h3>Không tìm thấy sản phẩm!</h3></div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="row">
                {/* ẢNH SẢN PHẨM */}
                <div className="col-md-5 mb-4">
                    <div className="card border-0 shadow-sm text-center p-3 rounded-4 bg-white border border-success border-opacity-10">
                        <img 
                            src={`${BACKEND_URL}/${product.image}`} 
                            className="img-fluid" 
                            alt={product.name} 
                            style={{ maxHeight: '450px', objectFit: 'contain' }} 
                            onError={(e) => { e.target.src = "https://via.placeholder.com/450?text=NNIT+Shop"; }}
                        />
                    </div>
                </div>

                {/* THÔNG TIN CHI TIẾT & CHỌN MUA */}
                <div className="col-md-7">
                    <h2 className="text-dark fw-bold">{product.name}</h2>
                    
                    <div className="price-block mb-4 mt-3">
                        {selectedVariant.isSale ? (
                            <>
                                <span className="price-main text-danger fw-bold fs-2">{formatPrice(selectedVariant.salePrice)} ₫</span>
                                <span className="price-old ms-3 text-muted text-decoration-line-through fs-5">{formatPrice(selectedVariant.price)} ₫</span>
                            </>
                        ) : (
                            <span className="price-main text-success fw-bold fs-2">{formatPrice(selectedVariant.price)} ₫</span>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="fw-bold mb-2 text-secondary">Cấu hình:</label><br />
                        <div className="d-flex flex-wrap gap-2">
                            {product.variants.map(v => (
                                <div key={v._id} 
                                     className={`variant-option border p-2 rounded-3 cursor-pointer ${selectedVariant._id === v._id ? 'active border-success bg-light text-success shadow-sm' : 'bg-white'}`} 
                                     onClick={() => setSelectedVariant(v)}
                                     style={{ cursor: 'pointer' }}>
                                    {v.storageCapacity} - {v.network}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold mb-2 text-secondary">Màu sắc: <span className="text-dark">{selectedVariant.colorName}</span></label><br />
                        <div className="variant-option active d-inline-block border border-success p-2 rounded-3 bg-light shadow-sm">
                            <span className="color-dot d-inline-block rounded-circle me-2 shadow-sm" style={{ backgroundColor: selectedVariant.colorHex, width: '15px', height: '15px', border: '1px solid #ccc' }}></span>
                            {selectedVariant.colorName}
                        </div>
                    </div>

                    <div className="row align-items-center mb-4">
                        <div className="col-auto"><label className="fw-bold text-secondary">Số lượng:</label></div>
                        <div className="col-auto">
                            <input 
                                type="number" 
                                className="form-control border-green rounded-pill text-center fw-bold" 
                                style={{ width: '90px' }}
                                min="1" max={selectedVariant.stock}
                                value={quantity} 
                                onChange={(e) => setQuantity(Math.min(selectedVariant.stock, Math.max(1, Number(e.target.value))))}
                                disabled={selectedVariant.stock === 0}
                            />
                        </div>
                        <div className="col-auto">
                            <span className="text-muted small">
                                {selectedVariant.stock > 0 ? `(Còn ${selectedVariant.stock} sản phẩm)` : <span className="text-danger fw-bold badge bg-danger text-white">HẾT HÀNG</span>}
                            </span>
                        </div>
                    </div>

                    <button 
                        className={`btn ${selectedVariant.stock === 0 ? 'btn-secondary' : 'btn-green'} btn-lg w-100 rounded-pill fw-bold shadow-sm py-3`} 
                        onClick={handleAddToCart}
                        disabled={selectedVariant.stock === 0}
                    >
                        {selectedVariant.stock === 0 ? 'TẠM HẾT HÀNG' : <><i className="bi bi-cart-plus me-2"></i>THÊM VÀO GIỎ HÀNG</>}
                    </button>
                </div>
            </div>

            {/* GỢI Ý SẢN PHẨM */}
            <div className="row mt-5">
                <div className="col-12">
                    <h3 className="fw-bold text-success mb-4 border-bottom pb-2"><i className="bi bi-stars me-2"></i>CÓ THỂ NHỚ CŨNG THÍCH</h3>
                    <div className="row row-cols-2 row-cols-md-4 g-4">
                        {relatedProducts.map(related => (
                            <div className="col" key={related._id}>
                                <div className="card h-100 related-card shadow-sm border-0 rounded-4 overflow-hidden text-center">
                                    <Link to={`/product/${related._id}`} className="text-decoration-none">
                                        <img src={`${BACKEND_URL}/${related.image}`} className="card-img-top p-3" alt={related.name} style={{ height: '150px', objectFit: 'contain' }} />
                                        <div className="card-body p-2 bg-white">
                                            <h6 className="text-dark fw-bold text-truncate mb-1 small">{related.name}</h6>
                                            <p className="text-success small fw-bold mb-0">Xem chi tiết</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* THÔNG SỐ & MÔ TẢ */}
            <div className="row mt-5 g-4">
                <div className="col-md-7">
                    <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                        <div className="card-header bg-green text-white fw-bold">ĐẶC ĐIỂM NỔI BẬT</div>
                        <div className="card-body text-justify" dangerouslySetInnerHTML={{ __html: product.description }}></div>
                    </div>
                </div>
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                        <div className="card-header bg-green text-white fw-bold">THÔNG SỐ KỸ THUẬT</div>
                        <table className="table table-striped tech-specs mb-0">
                            <tbody>
                                <tr><th className="ps-3 border-0">Màn hình:</th><td className="border-0">{product.specs?.screen}</td></tr>
                                <tr><th className="ps-3">Hệ điều hành:</th><td>{product.specs?.os}</td></tr>
                                <tr><th className="ps-3">Camera:</th><td>{product.specs?.cameraBack}</td></tr>
                                <tr><th className="ps-3">Vi xử lý:</th><td>{product.specs?.cpu}</td></tr>
                                <tr><th className="ps-3">Pin:</th><td>{product.specs?.battery}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* PHẦN ĐÁNH GIÁ GOOGLE PLAY STYLE */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-success text-white fw-bold py-3 text-uppercase">Xếp hạng và đánh giá</div>
                        <div className="card-body p-4 bg-white">
                            
                            {/* BIỂU ĐỒ TỔNG QUAN */}
                            <div className="row align-items-center mb-5 bg-light p-4 rounded-4 shadow-inner">
                                <div className="col-md-4 text-center border-end border-2 border-white">
                                    <h1 className="display-1 fw-bold text-dark mb-0">{stats.average || 0}</h1>
                                    <div className="text-warning fs-4 mb-2">
                                        {[...Array(5)].map((_, i) => <i key={i} className={`bi ${i < Math.round(stats.average) ? 'bi-star-fill' : 'bi-star'}`}></i>)}
                                    </div>
                                    <p className="text-muted fw-bold small text-uppercase">{stats.total} bài đánh giá</p>
                                </div>
                                <div className="col-md-8 px-md-5 mt-4 mt-md-0">
                                    {[5, 4, 3, 2, 1].map(num => {
                                        const count = stats.distribution[num] || 0;
                                        const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                        return (
                                            <div key={num} className="d-flex align-items-center mb-2">
                                                <span className="fw-bold me-3 text-secondary" style={{ width: '10px' }}>{num}</span>
                                                <div className="progress flex-grow-1 bg-white" style={{ height: '10px', borderRadius: '10px' }}>
                                                    <div className="progress-bar bg-success" style={{ width: `${percent}%`, borderRadius: '10px' }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FORM VIẾT ĐÁNH GIÁ MỚI */}
                            {user ? (
                                <form onSubmit={handleReviewSubmit} className="mb-5 bg-white border p-4 rounded-4 shadow-sm border-success border-opacity-10">
                                    <h5 className="fw-bold mb-3 text-success">Đánh giá của Nhớ</h5>
                                    <div className="mb-3">
                                        <div className="fs-2 text-warning mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <i key={star} className={`bi ${star <= reviewRating ? 'bi-star-fill' : 'bi-star'} cursor-pointer me-2`} onClick={() => setReviewRating(star)} style={{ cursor: 'pointer' }}></i>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea className="form-control mb-3 rounded-4 border-success border-opacity-20" rows="3" placeholder="Chia sẻ cảm nhận của Nhớ..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required></textarea>
                                    <button type="submit" className="btn btn-green rounded-pill px-5 fw-bold shadow-sm">GỬI ĐÁNH GIÁ</button>
                                </form>
                            ) : (
                                <div className="alert alert-info border-0 rounded-4 py-3 mb-5">Nhớ hãy <Link to="/login" className="fw-bold text-decoration-none">Đăng nhập</Link> để viết bài đánh giá nhé!</div>
                            )}

                            {/* DANH SÁCH NHẬN XÉT */}
                            <div className="review-list">
                                {reviews.map(rv => (
                                    <div key={rv._id} className="d-flex mb-4 p-3 bg-white border-bottom transition">
                                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm" style={{ width: '45px', height: '45px', flexShrink: 0 }}>{rv.name.charAt(0).toUpperCase()}</div>
                                        <div className="flex-grow-1">
                                            {editingReviewId === rv._id ? (
                                                <div className="bg-light p-3 rounded-4 border">
                                                    <div className="fs-3 text-warning mb-2">
                                                        {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bi ${s <= editRating ? 'bi-star-fill' : 'bi-star'} me-1`} onClick={() => setEditRating(s)} style={{cursor:'pointer'}}></i>)}
                                                    </div>
                                                    <textarea className="form-control mb-2 rounded-3" value={editContent} onChange={e => setEditContent(e.target.value)}></textarea>
                                                    <button className="btn btn-sm btn-success rounded-pill px-3" onClick={() => handleEditSubmit(rv._id)}>Lưu thay đổi</button>
                                                    <button className="btn btn-sm btn-secondary rounded-pill px-3 ms-2" onClick={() => setEditingReviewId(null)}>Hủy</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h6 className="fw-bold mb-0">{rv.name} {rv.user === user?._id && <span className="badge bg-soft-info text-info ms-2" style={{fontSize:'10px'}}>Đánh giá của bạn</span>}</h6>
                                                            <div className="text-warning mb-1" style={{ fontSize: '0.85rem' }}>
                                                                {[...Array(rv.rating)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
                                                                {[...Array(5 - rv.rating)].map((_, i) => <i key={i} className="bi bi-star"></i>)}
                                                            </div>
                                                        </div>
                                                        <small className="text-muted small">{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</small>
                                                    </div>
                                                    <p className="mb-2 text-dark" style={{ lineHeight: '1.6' }}>{rv.content}</p>

                                                    {/* HÀNH ĐỘNG CHO CHỦ SỞ HỮU HOẶC ADMIN */}
                                                    <div className="d-flex gap-3">
                                                        {user?._id === rv.user && (
                                                            <button className="btn btn-link btn-sm p-0 text-primary fw-bold text-decoration-none" onClick={() => { setEditingReviewId(rv._id); setEditRating(rv.rating); setEditContent(rv.content); }}>Sửa</button>
                                                        )}
                                                        {(user?._id === rv.user || user?.isAdmin) && (
                                                            <button className="btn btn-link btn-sm p-0 text-danger fw-bold text-decoration-none" onClick={() => handleDeleteReview(rv._id)}>Xóa</button>
                                                        )}
                                                        {user?.isAdmin && (
                                                            <button className="btn btn-link btn-sm p-0 text-success fw-bold text-decoration-none" onClick={() => setReplyingTo(replyingTo === rv._id ? null : rv._id)}>Phản hồi</button>
                                                        )}
                                                    </div>

                                                    {/* Form phản hồi của Admin */}
                                                    {replyingTo === rv._id && (
                                                        <div className="mt-3 d-flex gap-2">
                                                            <input className="form-control form-control-sm border-success rounded-pill px-3" placeholder="Nhập câu trả lời..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                                                            <button className="btn btn-sm btn-green rounded-pill px-3" onClick={() => handleReplySubmit(rv._id)}>GỬI</button>
                                                        </div>
                                                    )}

                                                    {/* Danh sách phản hồi */}
                                                    {rv.replies?.map(rep => (
                                                        <div key={rep._id} className="mt-3 bg-light p-3 rounded-4 border-start border-4 border-success shadow-sm">
                                                            <h6 className="fw-bold mb-1 small text-success"><i className="bi bi-patch-check-fill me-1"></i>ADMIN NNIT SHOP</h6>
                                                            <p className="mb-0 small text-secondary">{rep.content}</p>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOAST THÔNG BÁO GIỎ HÀNG */}
            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <div className="toast show align-items-center text-white bg-success border-0 rounded-pill shadow-lg">
                        <div className="d-flex">
                            <div className="toast-body fw-bold"><i className="bi bi-cart-check-fill me-2"></i> Đã thêm vào giỏ hàng thành công!</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;