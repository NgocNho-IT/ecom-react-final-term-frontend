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
    const [loading, setLoading] = useState(true);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const fetchProductDetail = async () => {
        try {
            const { data } = await API.get(`/products/${id}`);
            if (data.success) {
                setProduct(data.product);
                setRelatedProducts(data.relatedProducts);
                setReviews(data.reviews || []); 
                
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

    // Khi đổi Variant, nếu số lượng đang chọn lớn hơn tồn kho mới thì reset về 1
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
            console.error("Lỗi thêm vào giỏ:", error);
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
            alert("Cảm ơn bạn đã đánh giá!");
            setReviewContent('');
            fetchProductDetail(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi gửi đánh giá!");
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) return;
        try {
            await API.post(`/products/reviews/${reviewId}/reply`, { 
                content: replyContent 
            });
            alert("Đã gửi phản hồi!");
            setReplyingTo(null);
            setReplyContent('');
            fetchProductDetail(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi gửi phản hồi!");
        }
    };

    if (loading) return <div className="text-center mt-5 mb-5"><h3 className="text-success">Đang tải dữ liệu từ Server...</h3></div>;
    if (!product || !selectedVariant) return <div className="text-center mt-5 mb-5"><h3>Không tìm thấy sản phẩm!</h3></div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="row">
                <div className="col-md-5 mb-4">
                    <div className="card border-green shadow-sm text-center p-3 rounded-4 bg-white">
                        <img 
                            src={`${BACKEND_URL}/${product.image}`} 
                            className="img-fluid" 
                            alt={product.name} 
                            style={{ maxHeight: '450px', objectFit: 'contain' }} 
                            onError={(e) => { e.target.src = "https://via.placeholder.com/450?text=NNIT+Shop"; }}
                        />
                    </div>
                </div>

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
                        <label className="fw-bold mb-2 text-secondary">Chọn Cấu hình:</label><br />
                        <div className="d-flex flex-wrap gap-2">
                            {product.variants.map(variant => (
                                <div key={variant._id} 
                                     className={`variant-option border p-2 rounded-3 cursor-pointer ${selectedVariant._id === variant._id ? 'active border-success bg-light text-success' : ''}`} 
                                     onClick={() => setSelectedVariant(variant)}
                                     style={{ cursor: 'pointer' }}>
                                    {variant.storageCapacity} - {variant.network}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="fw-bold mb-2 text-secondary">Màu sắc:</label><br />
                        <div className="variant-option active d-inline-block border border-success p-2 rounded-3 bg-light">
                            <span className="color-dot d-inline-block rounded-circle me-2" style={{ backgroundColor: selectedVariant.colorHex, width: '15px', height: '15px', border: '1px solid #ccc' }}></span>
                            {selectedVariant.colorName}
                        </div>
                    </div>

                    {/* SỬA LOGIC SỐ LƯỢNG Ở ĐÂY */}
                    <div className="row align-items-center mb-3">
                        <div className="col-auto"><label className="fw-bold text-secondary">Số lượng:</label></div>
                        <div className="col-auto">
                            <input 
                                type="number" 
                                className="form-control border-green rounded-pill text-center fw-bold" 
                                style={{ width: '90px' }}
                                min="1" 
                                max={selectedVariant.stock > 0 ? selectedVariant.stock : 1}
                                value={quantity} 
                                onChange={(e) => {
                                    let val = Number(e.target.value);
                                    if (val > selectedVariant.stock) val = selectedVariant.stock; // Khóa giới hạn Max
                                    if (val < 1) val = 1; // Khóa giới hạn Min
                                    setQuantity(val);
                                }}
                                disabled={selectedVariant.stock === 0}
                            />
                        </div>
                        <div className="col-auto">
                            <span className="text-muted small">
                                {selectedVariant.stock > 0 ? `(Còn ${selectedVariant.stock} sản phẩm)` : <span className="text-danger fw-bold badge bg-danger text-white">HẾT HÀNG</span>}
                            </span>
                        </div>
                    </div>

                    <div className="d-grid gap-2 d-md-flex mt-4">
                        {user ? (
                            <button 
                                type="button" 
                                className={`btn ${selectedVariant.stock === 0 ? 'btn-secondary' : 'btn-green'} btn-lg px-5 fw-bold shadow-sm rounded-pill`} 
                                onClick={handleAddToCart}
                                disabled={selectedVariant.stock === 0}
                            >
                                {selectedVariant.stock === 0 ? (
                                    <><i className="bi bi-x-circle me-2"></i> TẠM HẾT HÀNG</>
                                ) : (
                                    <><i className="bi bi-cart-plus me-2"></i> THÊM VÀO GIỎ HÀNG</>
                                )}
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-warning btn-lg px-5 fw-bold shadow-sm text-dark rounded-pill">
                                <i className="bi bi-box-arrow-in-right me-2"></i> ĐĂNG NHẬP ĐỂ MUA HÀNG
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* BLOCK CÓ THỂ BẠN CŨNG THÍCH, MÔ TẢ, SPECS, YOUTUBE VÀ BÌNH LUẬN GIỮ NGUYÊN */}
            <div className="row mt-5">
                <div className="col-12">
                    <h3 className="fw-bold text-success mb-4 border-bottom pb-2"><i className="bi bi-stars me-2"></i>CÓ THỂ BẠN CŨNG THÍCH</h3>
                    <div className="row row-cols-2 row-cols-md-4 g-4">
                        {relatedProducts.length > 0 ? relatedProducts.map(related => (
                            <div className="col" key={related._id}>
                                <div className="card h-100 related-card shadow-sm border-0 rounded-4 overflow-hidden">
                                    <Link to={`/product/${related._id}`} className="text-decoration-none">
                                        <img 
                                            src={`${BACKEND_URL}/${related.image}`} 
                                            className="card-img-top p-3" 
                                            alt={related.name} 
                                            style={{ height: '150px', objectFit: 'contain' }} 
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=NNIT"; }}
                                        />
                                        <div className="card-body text-center p-2 bg-white">
                                            <h6 className="text-dark fw-bold text-truncate mb-1 small">{related.name}</h6>
                                            <p className="text-success small fw-bold mb-0">Xem chi tiết</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )) : <p className="text-muted ps-3">Đang cập nhật thêm gợi ý...</p>}
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col-md-7 mb-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                        <div className="card-header bg-green text-white fw-bold text-uppercase">ĐẶC ĐIỂM NỔI BẬT</div>
                        <div className="card-body text-justify" dangerouslySetInnerHTML={{ __html: product.description }}></div>
                    </div>
                </div>
                <div className="col-md-5 mb-4">
                    <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                        <div className="card-header bg-green text-white fw-bold text-uppercase">THÔNG SỐ KỸ THUẬT</div>
                        <div className="card-body p-0">
                            <table className="table table-striped tech-specs mb-0">
                                <tbody>
                                    <tr><th className="ps-3">Màn hình:</th><td>{product.specs?.screen || "Đang cập nhật"}</td></tr>
                                    <tr><th className="ps-3">OS:</th><td>{product.specs?.os || "Đang cập nhật"}</td></tr>
                                    <tr><th className="ps-3">Camera:</th><td>{product.specs?.cameraBack || "Đang cập nhật"}</td></tr>
                                    <tr><th className="ps-3">Pin:</th><td>{product.specs?.battery || "Đang cập nhật"}</td></tr>
                                    <tr><th className="ps-3">CPU:</th><td>{product.specs?.cpu || "Đang cập nhật"}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {(product.youtubeId || product.youtube_id) && (
                <div className="row mt-2 mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header bg-green text-white fw-bold text-uppercase"><i className="bi bi-play-btn-fill me-2"></i>VIDEO ĐÁNH GIÁ</div>
                            <div className="card-body p-0">
                                <div className="ratio ratio-16x9">
                                    <iframe src={`https://www.youtube.com/embed/${product.youtubeId || product.youtube_id}`} title="YouTube video" allowFullScreen></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="card-header bg-green text-white fw-bold text-uppercase">HỎI ĐÁP & ĐÁNH GIÁ SẢN PHẨM</div>
                        <div className="card-body p-4 bg-white">
                            
                            {user ? (
                                <form onSubmit={handleReviewSubmit} className="mb-5 bg-light p-4 rounded-4 border border-success border-opacity-10 shadow-sm">
                                    <h5 className="fw-bold mb-3 text-success">Gửi nhận xét của bạn</h5>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Đánh giá sao:</label>
                                        <select className="form-select w-auto d-inline-block border-green ms-2 rounded-pill" value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                                            <option value="5">5 Sao (Tuyệt vời)</option>
                                            <option value="4">4 Sao (Tốt)</option>
                                            <option value="3">3 Sao (Bình thường)</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <textarea className="form-control border-green rounded-4" rows="3" placeholder="Chia sẻ trải nghiệm..." value={reviewContent} onChange={e => setReviewContent(e.target.value)} required></textarea>
                                    </div>
                                    <div className="alert alert-success py-2 mb-3 border-0 rounded-pill" style={{ fontSize: '0.85rem' }}>
                                        <i className="bi bi-person-check-fill me-1"></i> Tài khoản: <strong>{user.firstName || user.name}</strong>
                                    </div>
                                    <button type="submit" className="btn btn-green fw-bold px-4 rounded-pill">GỬI ĐÁNH GIÁ</button>
                                </form>
                            ) : (
                                <div className="alert alert-info border-0 rounded-4 d-flex align-items-center mb-5">
                                    <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                                    <div><strong>Bạn chưa đăng nhập!</strong> Vui lòng <Link to="/login" className="text-danger fw-bold">Đăng nhập</Link> để gửi đánh giá.</div>
                                </div>
                            )}

                            <div>
                                {reviews.length > 0 ? reviews.map(review => (
                                    <div key={review._id} className="d-flex mb-4 p-3 border-bottom hover-bg-light rounded-3 transition">
                                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                                            {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-0">{review.name}</h6>
                                                    <div className="text-warning small mb-1">
                                                        {[...Array(review.rating)].map((_, i) => <i key={i} className="bi bi-star-fill"></i>)}
                                                    </div>
                                                </div>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                                            </div>
                                            <p className="mb-2 text-dark">{review.content}</p>

                                            {user && user.isAdmin && (
                                                <div className="mb-2">
                                                    <button className="btn btn-link btn-sm text-green p-0 text-decoration-none fw-bold" onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}>
                                                        <i className="bi bi-reply me-1"></i>Phản hồi
                                                    </button>
                                                    {replyingTo === review._id && (
                                                        <div className="mt-2 d-flex gap-2">
                                                            <input className="form-control form-control-sm border-green rounded-pill" placeholder="Trả lời..." value={replyContent} onChange={e => setReplyContent(e.target.value)} />
                                                            <button className="btn btn-sm btn-green rounded-pill px-3" onClick={() => handleReplySubmit(review._id)}>Gửi</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="mt-2">
                                                {review.replies && review.replies.map(reply => (
                                                    <div key={reply._id} className="mt-2 bg-light p-3 rounded-4 border-start border-4 border-success shadow-sm">
                                                        <h6 className="fw-bold mb-1 small text-success"><i className="bi bi-patch-check-fill me-1"></i>Admin NNIT Shop</h6>
                                                        <p className="mb-0 small text-secondary">{reply.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-muted italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showToast && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div className="toast show align-items-center text-white bg-success border-0 rounded-pill shadow-lg">
                        <div className="d-flex">
                            <div className="toast-body fw-bold"><i className="bi bi-cart-check-fill me-2"></i> Đã thêm vào giỏ hàng!</div>
                            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;