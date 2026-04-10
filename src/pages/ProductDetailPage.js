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
    const [hoverRating, setHoverRating] = useState(0); // State mới cho hiệu ứng hover sao
    const [reviewContent, setReviewContent] = useState('');
    
    // States cho việc phản hồi (Admin)
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    // States cho việc chỉnh sửa đánh giá (User)
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
        
        // Kiểm tra xem có hash URL không (từ trang admin chuyển qua)
        if (!window.location.hash) {
            window.scrollTo(0, 0);
        }
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

    // Hàm render sao thông minh (Hỗ trợ sao lẻ 4.5, 3.5)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<i key={i} className="bi bi-star-fill text-warning me-1"></i>);
            } else if (rating >= i - 0.5) {
                stars.push(<i key={i} className="bi bi-star-half text-warning me-1"></i>);
            } else {
                stars.push(<i key={i} className="bi bi-star text-warning me-1"></i>);
            }
        }
        return stars;
    };

    if (loading) return <div className="text-center mt-5 mb-5"><h3 className="text-success">Đang tải dữ liệu từ Server...</h3></div>;
    if (!product || !selectedVariant) return <div className="text-center mt-5 mb-5"><h3>Không tìm thấy sản phẩm!</h3></div>;

    return (
        <div className="container mt-4 mb-5">
            {/* THÊM CSS TRỰC TIẾP CHO PHẦN ĐÁNH GIÁ XỊN XÒ */}
            <style>
                {`
                    .star-interactive { transition: transform 0.2s ease, color 0.2s ease; display: inline-block; cursor: pointer; }
                    .star-interactive:hover { transform: scale(1.25); }
                    .review-item { border: 1px solid #eee; transition: all 0.3s ease; }
                    .review-item:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.05); transform: translateY(-2px); border-color: #d1e7dd; }
                    
                    /* Hiệu ứng chớp sáng khi Admin link thẳng tới bình luận */
                    .review-item:target { animation: highlight-review 2.5s ease-out; }
                    @keyframes highlight-review {
                        0% { box-shadow: 0 0 0 3px #198754, 0 0 20px rgba(25,135,84,0.3); background-color: #f0fff4; }
                        100% { box-shadow: 0 5px 15px rgba(0,0,0,0.05); background-color: #ffffff; }
                    }
                    
                    .progress-bar-animated { transition: width 1s ease-in-out; }
                `}
            </style>

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
                    <h3 className="fw-bold text-success mb-4 border-bottom pb-2"><i className="bi bi-stars me-2"></i>CÓ THỂ BẠN CŨNG THÍCH</h3>
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

            {/* PHẦN ĐÁNH GIÁ GOOGLE PLAY STYLE - ĐÃ ĐƯỢC NÂNG CẤP */}
            <div className="row mt-5">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-success text-white fw-bold py-3 text-uppercase">
                            <i className="bi bi-chat-heart-fill me-2"></i>Đánh giá từ khách hàng
                        </div>
                        <div className="card-body p-4 bg-white">
                            
                            {/* BIỂU ĐỒ TỔNG QUAN XỊN XÒ */}
                            <div className="row align-items-center mb-5 bg-light p-4 rounded-4 shadow-inner">
                                <div className="col-md-4 text-center border-end border-2 border-white">
                                    <h1 className="display-1 fw-bold text-dark mb-0">{Number(stats.average).toFixed(1)}</h1>
                                    <div className="fs-3 mb-2">
                                        {renderStars(stats.average)}
                                    </div>
                                    <p className="text-muted fw-bold small text-uppercase"><i className="bi bi-person-check-fill me-1"></i>{stats.total} bài đánh giá</p>
                                </div>
                                <div className="col-md-8 px-md-5 mt-4 mt-md-0">
                                    {[5, 4, 3, 2, 1].map(num => {
                                        const count = stats.distribution[num] || 0;
                                        const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                        return (
                                            <div key={num} className="d-flex align-items-center mb-2">
                                                <span className="fw-bold me-2 text-secondary">{num}</span>
                                                <i className="bi bi-star-fill text-warning me-3 small"></i>
                                                <div className="progress flex-grow-1 bg-white border" style={{ height: '12px', borderRadius: '10px' }}>
                                                    <div className="progress-bar bg-warning progress-bar-animated" style={{ width: `${percent}%`, borderRadius: '10px' }}></div>
                                                </div>
                                                <span className="ms-3 text-muted small" style={{width: '30px'}}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FORM VIẾT ĐÁNH GIÁ MỚI BẰNG HIỆU ỨNG HOVER */}
                            {user ? (
                                <form onSubmit={handleReviewSubmit} className="mb-5 bg-white border p-4 rounded-4 shadow-sm border-success border-opacity-25">
                                    <h5 className="fw-bold mb-3 text-success">Viết đánh giá của bạn</h5>
                                    <div className="mb-3 d-flex align-items-center">
                                        <span className="me-3 fw-bold text-secondary">Chất lượng sản phẩm:</span>
                                        <div className="fs-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <i key={star} 
                                                   className={`bi ${star <= (hoverRating || reviewRating) ? 'bi-star-fill text-warning' : 'bi-star text-muted opacity-50'} star-interactive me-2`} 
                                                   onMouseEnter={() => setHoverRating(star)}
                                                   onMouseLeave={() => setHoverRating(0)}
                                                   onClick={() => setReviewRating(star)}
                                                ></i>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea className="form-control mb-3 rounded-4 bg-light border-0" rows="3" placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required></textarea>
                                    <button type="submit" className="btn btn-green rounded-pill px-5 fw-bold shadow-sm"><i className="bi bi-send-fill me-2"></i>GỬI ĐÁNH GIÁ</button>
                                </form>
                            ) : (
                                <div className="alert alert-success bg-success bg-opacity-10 border-0 rounded-4 py-4 mb-5 text-center">
                                    <i className="bi bi-shield-lock-fill fs-4 text-success d-block mb-2"></i>
                                    Bạn cần <Link to="/login" className="fw-bold text-success text-decoration-none border-bottom border-success">Đăng nhập</Link> để tham gia đánh giá sản phẩm.
                                </div>
                            )}

                            {/* DANH SÁCH NHẬN XÉT (CÓ ID ĐỂ LINK TỪ ADMIN SANG) */}
                            <div className="review-list">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-chat-square-text fs-1 d-block mb-3 opacity-50"></i>
                                        <p>Chưa có đánh giá nào. Hãy là người đầu tiên nhận xét!</p>
                                    </div>
                                ) : (
                                    reviews.map(rv => (
                                        <div key={rv._id} id={`review-${rv._id}`} className="d-flex mb-4 p-4 bg-white rounded-4 review-item">
                                            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm fs-5" style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                                                {rv.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow-1">
                                                {editingReviewId === rv._id ? (
                                                    <div className="bg-light p-3 rounded-4 border border-warning">
                                                        <div className="fs-3 mb-2">
                                                            {[1, 2, 3, 4, 5].map(s => 
                                                                <i key={s} 
                                                                   className={`bi ${s <= (editHoverRating || editRating) ? 'bi-star-fill text-warning' : 'bi-star text-muted opacity-50'} star-interactive me-1`} 
                                                                   onMouseEnter={() => setEditHoverRating(s)}
                                                                   onMouseLeave={() => setEditHoverRating(0)}
                                                                   onClick={() => setEditRating(s)}
                                                                ></i>
                                                            )}
                                                        </div>
                                                        <textarea className="form-control mb-3 rounded-3 border-0" rows="2" value={editContent} onChange={e => setEditContent(e.target.value)}></textarea>
                                                        <button className="btn btn-sm btn-warning rounded-pill px-4 fw-bold me-2" onClick={() => handleEditSubmit(rv._id)}>Cập nhật</button>
                                                        <button className="btn btn-sm btn-outline-secondary rounded-pill px-4" onClick={() => setEditingReviewId(null)}>Hủy</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <div>
                                                                <h6 className="fw-bold mb-1 text-dark fs-5">
                                                                    {rv.name} 
                                                                    {rv.user === user?._id && <span className="badge bg-success ms-2 fw-normal" style={{fontSize:'11px'}}>Của bạn</span>}
                                                                </h6>
                                                                <div className="mb-2">
                                                                    {renderStars(rv.rating)}
                                                                </div>
                                                            </div>
                                                            <small className="text-muted bg-light px-2 py-1 rounded-pill" style={{fontSize: '12px'}}>
                                                                <i className="bi bi-calendar3 me-1"></i>{new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                                                            </small>
                                                        </div>
                                                        
                                                        <p className="mb-3 text-secondary" style={{ lineHeight: '1.7', fontSize: '15px' }}>{rv.content}</p>

                                                        {/* HÀNH ĐỘNG CHO CHỦ SỞ HỮU HOẶC ADMIN */}
                                                        <div className="d-flex gap-3 border-top pt-2">
                                                            {user?._id === rv.user && (
                                                                <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none" onClick={() => { setEditingReviewId(rv._id); setEditRating(rv.rating); setEditContent(rv.content); }}><i className="bi bi-pencil-square me-1"></i>Sửa</button>
                                                            )}
                                                            {(user?._id === rv.user || user?.isAdmin) && (
                                                                <button className="btn btn-link btn-sm p-0 text-danger text-decoration-none" onClick={() => handleDeleteReview(rv._id)}><i className="bi bi-trash me-1"></i>Xóa</button>
                                                            )}
                                                            {user?.isAdmin && (
                                                                <button className="btn btn-link btn-sm p-0 text-success text-decoration-none" onClick={() => setReplyingTo(replyingTo === rv._id ? null : rv._id)}><i className="bi bi-reply-fill me-1"></i>Phản hồi</button>
                                                            )}
                                                        </div>

                                                        {/* Form phản hồi của Admin */}
                                                        {replyingTo === rv._id && (
                                                            <div className="mt-3 d-flex gap-2 bg-success bg-opacity-10 p-3 rounded-4">
                                                                <input className="form-control form-control-sm border-0 rounded-pill px-4 shadow-sm" placeholder="Nhập câu trả lời của Admin..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                                                                <button className="btn btn-sm btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={() => handleReplySubmit(rv._id)}>GỬI</button>
                                                            </div>
                                                        )}

                                                        {/* Danh sách phản hồi của cửa hàng */}
                                                        {rv.replies?.length > 0 && (
                                                            <div className="mt-3">
                                                                {rv.replies.map(rep => (
                                                                    <div key={rep._id} className="bg-light p-3 rounded-4 border-start border-4 border-success ms-4 position-relative">
                                                                        <i className="bi bi-arrow-return-right position-absolute text-success" style={{left: '-20px', top: '15px'}}></i>
                                                                        <h6 className="fw-bold mb-1 small text-success"><i className="bi bi-patch-check-fill me-1"></i>Quản trị viên NNIT SHOP</h6>
                                                                        <p className="mb-0 small text-dark">{rep.content}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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

            {/* TOAST THÔNG BÁO GIỎ HÀNG */}
            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
                    <div className="toast show align-items-center text-white bg-success border-0 rounded-pill shadow-lg">
                        <div className="d-flex">
                            <div className="toast-body fw-bold"><i className="bi bi-cart-check-fill me-2 fs-5 align-middle"></i> Đã thêm vào giỏ hàng thành công!</div>
                            <button type="button" className="btn-close btn-close-white me-3 m-auto" onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;