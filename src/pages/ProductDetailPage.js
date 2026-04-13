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
    
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0); 
    const [reviewContent, setReviewContent] = useState('');
    
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editHoverRating, setEditHoverRating] = useState(0);
    const [editContent, setEditContent] = useState('');

    const fetchProductDetail = async () => {
        try {
            const { data } = await API.get(`/products/${id}`);
            if (data.success) {
                setProduct(data.product);
                setRelatedProducts(data.relatedProducts);
                setReviews(data.reviews || []); 
                setStats(data.ratingStats || { average: 0, total: 0, distribution: {1:0, 2:0, 3:0, 4:0, 5:0} });
                
                // Luôn cập nhật biến thể đầu tiên khi tải sản phẩm mới
                if (data.product.variants && data.product.variants.length > 0) {
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
        // Reset biến thể về null ngay khi ID sản phẩm thay đổi để xóa dữ liệu cũ
        setSelectedVariant(null);
        
        fetchProductDetail();
        
        if (!window.location.hash) {
            window.scrollTo(0, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (selectedVariant && quantity > selectedVariant.stock) {
            setQuantity(selectedVariant.stock === 0 ? 0 : 1);
        }
    }, [selectedVariant, quantity]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    // Hàm kiểm tra quyền sở hữu bài đánh giá chuẩn xác nhất
    const isOwner = (reviewUser) => {
        if (!user || !reviewUser) return false;
        const reviewUserId = typeof reviewUser === 'object' ? reviewUser._id : reviewUser;
        return user._id === reviewUserId;
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert("Vui lòng đăng nhập để mua hàng!");
            navigate('/login');
            return;
        }
        if (!selectedVariant) return;

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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/products/${id}/reviews`, { 
                rating: reviewRating, 
                content: reviewContent 
            });
            alert("Cảm ơn bài đánh giá của bạn!");
            setReviewContent('');
            setReviewRating(5);
            fetchProductDetail(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
        }
    };

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

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Bạn chắc chắn muốn xóa đánh giá này chứ?")) {
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

    const renderStars = (rating, size = '1rem') => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<i key={i} className="bi bi-star-fill text-warning" style={{marginRight: '2px', fontSize: size}}></i>);
            } else if (rating >= i - 0.5) {
                stars.push(<i key={i} className="bi bi-star-half text-warning" style={{marginRight: '2px', fontSize: size}}></i>);
            } else {
                stars.push(<i key={i} className="bi bi-star-fill text-black-50 opacity-25" style={{marginRight: '2px', fontSize: size}}></i>);
            }
        }
        return stars;
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
            <h4 className="text-success fw-bold">Đang tải chi tiết sản phẩm...</h4>
        </div>
    );

    if (!product || !selectedVariant) return <div className="text-center mt-5 mb-5"><h3>Không tìm thấy sản phẩm!</h3></div>;

    return (
        <div className="product-detail-wrapper" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 0' }}>
            <style>
                {`
                    .star-interactive { transition: transform 0.2s ease, color 0.2s ease; display: inline-block; cursor: pointer; }
                    .star-interactive:hover { transform: scale(1.25); }
                    .review-item { border: 1px solid #eee; transition: all 0.3s ease; }
                    .review-item:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); border-color: #d1e7dd; }
                    .review-item:target { animation: highlight-review 2.5s ease-out; }
                    @keyframes highlight-review {
                        0% { box-shadow: 0 0 0 3px #198754, 0 0 20px rgba(25,135,84,0.3); background-color: #f0fff4; }
                        100% { box-shadow: 0 5px 15px rgba(0,0,0,0.05); background-color: #ffffff; }
                    }
                    .progress-bar-animated { transition: width 1s ease-in-out; }
                    
                    .shopee-border { border-color: rgba(0,0,0,.09) !important; }
                    
                    .price-bg { 
                        background: linear-gradient(to right, #f8f9fa, #ffffff); 
                        border-left: 5px solid #198754; 
                    }
                    .variant-option { 
                        transition: all 0.2s ease; 
                        border: 2px solid #e2e8f0 !important; 
                        font-weight: 500;
                    }
                    .variant-option:hover { 
                        border-color: #198754 !important; 
                        background-color: #f8f9fa; 
                    }
                    .variant-option.active { 
                        border-color: #198754 !important; 
                        background-color: #e8f5e9 !important; 
                        color: #198754;
                    }
                    .custom-shadow {
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    }
                `}
            </style>

            <div className="container">
                <div className="row">
                    {/* ẢNH SẢN PHẨM */}
                    <div className="col-md-5 mb-4">
                        <div className="card border-0 custom-shadow text-center p-4 rounded-4 bg-white border border-success border-opacity-10 position-sticky" style={{ top: '20px' }}>
                            <img 
                                src={`${BACKEND_URL}/${product.image}`} 
                                className="img-fluid" 
                                alt={product.name} 
                                style={{ maxHeight: '450px', objectFit: 'contain', transition: 'transform 0.4s ease' }} 
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onError={(e) => { e.target.src = "https://via.placeholder.com/450?text=NNIT+Shop"; }}
                            />
                        </div>
                    </div>

                    {/* THÔNG TIN CHI TIẾT & CHỌN MUA */}
                    <div className="col-md-7 ps-md-4">
                        <div className="card border-0 custom-shadow p-4 rounded-4 bg-white mb-4">
                            <h2 className="text-dark fw-bolder mb-2 lh-base">{product.name}</h2>
                            
                            <div className="d-flex align-items-center mb-4 pb-2 mt-3">
                                <div className="d-flex align-items-center pe-3 border-end shopee-border">
                                    {product.rating > 0 ? (
                                        <>
                                            <span className="text-danger fw-bolder fs-5 me-2 border-bottom border-danger lh-1">
                                                {Number(product.rating).toFixed(1)}
                                            </span>
                                            <div className="d-flex align-items-center">
                                                {renderStars(product.rating, '1.1rem')}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="d-flex align-items-center me-2">
                                                {renderStars(0, '1.1rem')}
                                            </div>
                                            <span className="text-muted fst-italic small">Chưa có đánh giá</span>
                                        </>
                                    )}
                                </div>

                                <div className="px-3 border-end shopee-border">
                                    <span className="fw-bold text-dark fs-5 border-bottom border-dark lh-1 me-1">{product.numReviews || 0}</span> 
                                    <span className="text-muted small text-uppercase">Đánh Giá</span>
                                </div>

                                <div className="ps-3">
                                    <span className="fw-bold text-dark fs-5 lh-1 me-1">{product.sold || 0}</span>
                                    <span className="text-muted small text-uppercase">Đã Bán</span> 
                                </div>
                            </div>

                            <div className="price-bg mb-4 p-4 rounded-3 shadow-sm border border-success border-opacity-10 border-start-0">
                                {selectedVariant.isSale ? (
                                    <div className="d-flex align-items-center flex-wrap">
                                        <span className="price-old text-muted text-decoration-line-through fs-5 me-3">{formatPrice(selectedVariant.price)} ₫</span>
                                        <span className="price-main text-danger fw-bold display-6 mb-0 lh-1">{formatPrice(selectedVariant.salePrice)} ₫</span>
                                        <span className="badge bg-danger ms-3 px-3 py-2 rounded-pill shadow-sm"><i className="bi bi-lightning-charge-fill me-1"></i>Giảm sốc</span>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <span className="price-main text-success fw-bold display-6 mb-0 lh-1">{formatPrice(selectedVariant.price)} ₫</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="fw-bold mb-3 text-secondary text-uppercase small">Tùy chọn Cấu hình:</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.variants.map(v => (
                                        <div key={v._id} 
                                             className={`variant-option p-2 px-3 rounded-3 cursor-pointer ${selectedVariant._id === v._id ? 'active shadow-sm' : 'bg-white'}`} 
                                             onClick={() => setSelectedVariant(v)}
                                             style={{ cursor: 'pointer' }}>
                                            {v.storageCapacity} - {v.network}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="fw-bold mb-3 text-secondary text-uppercase small">Màu sắc hiện tại:</label><br />
                                <div className="variant-option active d-inline-block p-2 px-3 rounded-3 shadow-sm">
                                    <span className="color-dot d-inline-block rounded-circle me-2 shadow-sm" style={{ backgroundColor: selectedVariant.colorHex, width: '16px', height: '16px' }}></span>
                                    {selectedVariant.colorName}
                                </div>
                            </div>

                            <div className="row align-items-center mb-4 pb-2">
                                <div className="col-auto"><label className="fw-bold text-secondary text-uppercase small">Số lượng:</label></div>
                                <div className="col-auto">
                                    <input 
                                        type="number" 
                                        className="form-control border-green rounded-3 text-center fw-bold bg-light" 
                                        style={{ width: '90px' }}
                                        min="1" max={selectedVariant.stock}
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Math.min(selectedVariant.stock, Math.max(1, Number(e.target.value))))}
                                        disabled={selectedVariant.stock === 0}
                                    />
                                </div>
                                <div className="col-auto">
                                    <span className="text-muted small fw-bold">
                                        {selectedVariant.stock > 0 ? `(Kho còn ${selectedVariant.stock} sản phẩm)` : <span className="badge bg-danger px-3 py-2 rounded-pill"><i className="bi bi-x-circle me-1"></i>TẠM HẾT HÀNG</span>}
                                    </span>
                                </div>
                            </div>

                            <button 
                                className={`btn ${selectedVariant.stock === 0 ? 'btn-secondary' : 'btn-success'} btn-lg w-100 rounded-pill fw-bold shadow-sm py-3`} 
                                onClick={handleAddToCart}
                                disabled={selectedVariant.stock === 0}
                            >
                                {selectedVariant.stock === 0 ? 'TẠM HẾT HÀNG' : <><i className="bi bi-cart-plus-fill me-2 fs-5"></i>THÊM VÀO GIỎ HÀNG</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row mt-3 pt-3 g-4">
                    <div className="col-md-7">
                        <div className="card border-0 custom-shadow h-100 rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="fw-bold text-success mb-0"><i className="bi bi-card-text me-2"></i>ĐẶC ĐIỂM NỔI BẬT</h5>
                            </div>
                            <div className="card-body p-4 text-justify" style={{ lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: product.description }}></div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card border-0 custom-shadow h-100 rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-white border-bottom py-3">
                                <h5 className="fw-bold text-success mb-0"><i className="bi bi-cpu-fill me-2"></i>THÔNG SỐ KỸ THUẬT</h5>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-hover table-striped tech-specs mb-0 m-0">
                                    <tbody>
                                        <tr><th className="ps-4 py-3 border-0 w-40 text-muted">Màn hình:</th><td className="border-0 py-3 fw-bold text-dark">{product.specs?.screen}</td></tr>
                                        <tr><th className="ps-4 py-3 text-muted">Hệ điều hành:</th><td className="py-3 fw-bold text-dark">{product.specs?.os}</td></tr>
                                        <tr><th className="ps-4 py-3 text-muted">Camera sau:</th><td className="py-3 fw-bold text-dark">{product.specs?.cameraBack}</td></tr>
                                        <tr><th className="ps-4 py-3 text-muted">Camera trước:</th><td className="py-3 fw-bold text-dark">{product.specs?.cameraFront}</td></tr>
                                        <tr><th className="ps-4 py-3 text-muted">Vi xử lý:</th><td className="py-3 fw-bold text-dark">{product.specs?.cpu}</td></tr>
                                        <tr><th className="ps-4 py-3 border-bottom-0 text-muted">Dung lượng Pin:</th><td className="border-bottom-0 py-3 fw-bold text-dark">{product.specs?.battery}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* YOUTUBE VIDEO SECTION */}
                {product.youtubeId && (
                    <div className="row mt-5 pt-3">
                        <div className="col-12">
                            <h4 className="fw-bold text-dark mb-4 border-start border-danger border-5 ps-3">VIDEO SẢN PHẨM</h4>
                            <div className="card border-0 custom-shadow rounded-4 overflow-hidden bg-white">
                                <div className="ratio ratio-16x9">
                                    <iframe 
                                        src={`https://www.youtube.com/embed/${product.youtubeId}`} 
                                        title="YouTube video" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row mt-5 pt-3">
                    <div className="col-12">
                        <h4 className="fw-bold text-dark mb-4 border-start border-success border-4 ps-3">CÓ THỂ BẠN CŨNG THÍCH</h4>
                        <div className="row row-cols-2 row-cols-md-4 g-4">
                            {relatedProducts.map(related => (
                                <div className="col" key={related._id}>
                                    <div className="card h-100 custom-shadow border-0 rounded-4 overflow-hidden text-center product-card bg-white" style={{ transition: 'all 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <Link to={`/product/${related._id}`} className="text-decoration-none">
                                            <img src={`${BACKEND_URL}/${related.image}`} className="card-img-top p-4" alt={related.name} style={{ height: '180px', objectFit: 'contain' }} />
                                            <div className="card-body p-3 pt-0 bg-white">
                                                <h6 className="text-dark fw-bold text-truncate mb-2">{related.name}</h6>
                                                <div className="mb-2 d-flex justify-content-center">{renderStars(related.rating || 0, '0.8rem')}</div>
                                                <p className="text-success small fw-bold mb-0 border border-success rounded-pill d-inline-block px-3 py-1">Xem chi tiết</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="row mt-5 pt-3">
                    <div className="col-12">
                        <div className="card border-0 custom-shadow rounded-4 overflow-hidden bg-white">
                            <div className="card-header bg-success text-white fw-bold py-3 text-uppercase">
                                <i className="bi bi-chat-heart-fill me-2"></i>ĐÁNH GIÁ TỪ KHÁCH HÀNG MUA TRƯỚC
                            </div>
                            <div className="card-body p-4 p-md-5">
                                <div className="row align-items-center mb-5 bg-light p-4 rounded-4 shadow-inner border border-success border-opacity-10">
                                    <div className="col-md-4 text-center border-end border-2 border-white">
                                        <h1 className="display-1 fw-bold text-dark mb-0 lh-1">{Number(stats.average).toFixed(1)}</h1>
                                        <div className="fs-3 mb-2 mt-2 d-flex justify-content-center">
                                            {renderStars(stats.average, '1.5rem')}
                                        </div>
                                        <p className="text-muted fw-bold small text-uppercase mb-0"><i className="bi bi-person-check-fill me-1"></i>{stats.total} bài đánh giá</p>
                                    </div>
                                    <div className="col-md-8 px-md-5 mt-4 mt-md-0">
                                        {[5, 4, 3, 2, 1].map(num => {
                                            const count = stats.distribution[num] || 0;
                                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                            return (
                                                <div key={num} className="d-flex align-items-center mb-2">
                                                    <span className="fw-bold me-2 text-secondary w-10 text-end">{num}</span>
                                                    <i className="bi bi-star-fill text-warning me-3 small"></i>
                                                    <div className="progress flex-grow-1 bg-white border" style={{ height: '10px', borderRadius: '10px' }}>
                                                        <div className="progress-bar bg-warning progress-bar-animated" style={{ width: `${percent}%`, borderRadius: '10px' }}></div>
                                                    </div>
                                                    <span className="ms-3 text-muted small text-end" style={{width: '35px'}}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {user ? (
                                    <form onSubmit={handleReviewSubmit} className="mb-5 bg-white border p-4 rounded-4 shadow-sm border-success border-opacity-25">
                                        <h5 className="fw-bold mb-3 text-success"><i className="bi bi-pencil-square me-2"></i>Viết đánh giá của bạn</h5>
                                        <div className="mb-3 d-flex align-items-center bg-light p-3 rounded-3">
                                            <span className="me-3 fw-bold text-secondary">Bạn chấm sản phẩm này mấy sao?</span>
                                            <div className="fs-2 d-flex">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <i key={star} className={`bi ${star <= (hoverRating || reviewRating) ? 'bi-star-fill text-warning' : 'bi-star-fill text-black-50 opacity-25'} star-interactive me-2`} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(star)}></i>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea className="form-control mb-3 rounded-4 bg-light border-0 p-3" rows="3" placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required></textarea>
                                        <div className="text-end">
                                            <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-sm"><i className="bi bi-send-fill me-2"></i>GỬI ĐÁNH GIÁ</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="alert alert-success bg-success bg-opacity-10 border-0 rounded-4 py-4 mb-5 text-center">
                                        <i className="bi bi-shield-lock-fill fs-3 text-success d-block mb-2"></i>
                                        Bạn cần <Link to="/login" className="fw-bold text-success text-decoration-none border-bottom border-success">Đăng nhập</Link> để tham gia đánh giá sản phẩm.
                                    </div>
                                )}

                                <div className="review-list">
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-5 text-muted bg-light rounded-4 border border-dashed">
                                            <i className="bi bi-chat-square-text fs-1 d-block mb-3 opacity-50"></i>
                                            <p className="fw-bold">Chưa có đánh giá nào.</p>
                                        </div>
                                    ) : (
                                        reviews.map(rv => (
                                            <div key={rv._id} id={`review-${rv._id}`} className="d-flex mb-4 p-4 bg-white rounded-4 review-item shadow-sm border border-opacity-10">
                                                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm fs-4" style={{ width: '55px', height: '55px', flexShrink: 0 }}>{rv.name.charAt(0).toUpperCase()}</div>
                                                <div className="flex-grow-1">
                                                    {editingReviewId === rv._id ? (
                                                        <div className="bg-light p-4 rounded-4 border border-warning shadow-inner">
                                                            <div className="fs-4 mb-3 d-flex">
                                                                {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bi ${s <= (editHoverRating || editRating) ? 'bi-star-fill text-warning' : 'bi-star-fill text-black-50 opacity-25'} star-interactive me-2`} onMouseEnter={() => setEditHoverRating(s)} onMouseLeave={() => setEditHoverRating(0)} onClick={() => setEditRating(s)}></i>)}
                                                            </div>
                                                            <textarea className="form-control mb-3 rounded-3 border-0 p-3 shadow-sm" rows="3" value={editContent} onChange={e => setEditContent(e.target.value)}></textarea>
                                                            <div className="text-end">
                                                                <button className="btn btn-sm btn-secondary rounded-pill px-4 me-2 fw-bold" onClick={() => setEditingReviewId(null)}>Hủy Bỏ</button>
                                                                <button className="btn btn-sm btn-warning rounded-pill px-4 fw-bold shadow-sm" onClick={() => handleEditSubmit(rv._id)}><i className="bi bi-check-circle me-1"></i>Lưu Chỉnh Sửa</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>
                                                                    <h6 className="fw-bold mb-1 text-dark fs-6 d-flex align-items-center">
                                                                        {rv.name} 
                                                                        {isOwner(rv.user) && <span className="badge bg-success ms-2 fw-bold shadow-sm" style={{fontSize:'10px'}}>Của bạn</span>}
                                                                    </h6>
                                                                    <div className="mb-2 d-flex">{renderStars(rv.rating, '0.85rem')}</div>
                                                                </div>
                                                                <small className="text-muted bg-light px-3 py-1 rounded-pill border" style={{fontSize: '11px', fontWeight: '500'}}>
                                                                    <i className="bi bi-clock me-1"></i>{new Date(rv.createdAt).toLocaleString('vi-VN')}
                                                                </small>
                                                            </div>
                                                            <p className="mb-4 text-dark bg-light p-3 rounded-3" style={{ lineHeight: '1.6', fontSize: '15px' }}>{rv.content}</p>
                                                            
                                                            <div className="d-flex gap-3 border-top pt-3">
                                                                {isOwner(rv.user) && (
                                                                    <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-bold" onClick={() => { setEditingReviewId(rv._id); setEditRating(rv.rating); setEditContent(rv.content); }}>
                                                                        <i className="bi bi-pencil-square me-1"></i>Sửa bài
                                                                    </button>
                                                                )}
                                                                {(isOwner(rv.user) || user?.isAdmin) && (
                                                                    <button className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-bold" onClick={() => handleDeleteReview(rv._id)}>
                                                                        <i className="bi bi-trash3-fill me-1"></i>Xóa bài
                                                                    </button>
                                                                )}
                                                                {user?.isAdmin && (
                                                                    <button className="btn btn-link btn-sm p-0 text-success text-decoration-none fw-bold ms-auto" onClick={() => setReplyingTo(replyingTo === rv._id ? null : rv._id)}>
                                                                        <i className="bi bi-reply-fill me-1"></i>Phản hồi
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {replyingTo === rv._id && (
                                                                <div className="mt-3 bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25">
                                                                    <div className="d-flex gap-2">
                                                                        <input className="form-control border-0 rounded-pill px-4 shadow-sm" placeholder="Nhập câu trả lời..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                                                                        <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => handleReplySubmit(rv._id)}>
                                                                            <i className="bi bi-send-fill"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* HIỂN THỊ DANH SÁCH PHẢN HỒI (REPLIES) ĐÃ FIX NÚT SỬA/XÓA */}
                                                            {rv.replies?.map(rep => (
                                                                <div key={rep._id} className="bg-white p-3 rounded-4 border-start border-4 border-success ms-4 mt-3 position-relative shadow-sm">
                                                                    <i className="bi bi-arrow-return-right position-absolute text-success fs-5" style={{left: '-25px', top: '15px'}}></i>
                                                                    
                                                                    {editingReviewId === rep._id ? (
                                                                        <div className="bg-light p-3 rounded-4 border border-warning shadow-inner mt-2">
                                                                            <textarea 
                                                                                className="form-control mb-3 rounded-3 border-0 p-3 shadow-sm" 
                                                                                rows="2" 
                                                                                value={editContent} 
                                                                                onChange={e => setEditContent(e.target.value)}
                                                                            ></textarea>
                                                                            <div className="text-end">
                                                                                <button className="btn btn-sm btn-secondary rounded-pill px-4 me-2 fw-bold" onClick={() => setEditingReviewId(null)}>Hủy</button>
                                                                                <button className="btn btn-sm btn-warning rounded-pill px-4 fw-bold shadow-sm" onClick={() => handleEditSubmit(rep._id)}>
                                                                                    <i className="bi bi-check-circle me-1"></i>Lưu
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                <span className="badge bg-success rounded-pill py-1 px-2 fw-bold small">Quản trị viên NNIT SHOP</span>
                                                                                <small className="text-muted" style={{fontSize: '11px'}}>
                                                                                    {new Date(rep.createdAt).toLocaleString('vi-VN')}
                                                                                </small>
                                                                            </div>
                                                                            <p className="mb-2 text-dark" style={{fontSize: '14px'}}>{rep.content}</p>
                                                                            
                                                                            {user?.isAdmin && (
                                                                                <div className="d-flex gap-3 pt-2 border-top border-light mt-2">
                                                                                    <button 
                                                                                        className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-bold" 
                                                                                        onClick={() => { 
                                                                                            setEditingReviewId(rep._id); 
                                                                                            setEditRating(5); 
                                                                                            setEditContent(rep.content); 
                                                                                        }}
                                                                                    >
                                                                                        <i className="bi bi-pencil-square me-1"></i>Sửa
                                                                                    </button>
                                                                                    <button 
                                                                                        className="btn btn-link btn-sm p-0 text-danger text-decoration-none fw-bold" 
                                                                                        onClick={() => handleDeleteReview(rep._id)}
                                                                                    >
                                                                                        <i className="bi bi-trash3-fill me-1"></i>Xóa
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
                    <div className="toast show align-items-center text-white bg-success border-0 rounded-4 shadow-lg">
                        <div className="d-flex p-2">
                            <div className="toast-body fw-bold fs-6"><i className="bi bi-cart-check-fill me-2 fs-4 align-middle"></i> Đã thêm vào giỏ hàng thành công!</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;