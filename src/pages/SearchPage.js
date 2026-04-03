import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../services/api';

// KHAI BÁO URL BACKEND ĐỂ GỌI ẢNH ĐÚNG CỔNG 5000
const BACKEND_URL = "http://localhost:5000";

// Hook phụ trợ để lấy tham số query trên URL
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
    const queryParam = useQuery().get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Gọi API tìm kiếm từ Backend
                const { data } = await API.get(`/products/search?q=${queryParam}`);
                if (data.success) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };

        if (queryParam) {
            fetchSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [queryParam]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    return (
        <>
            <style>
                {`
                    .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 15px; overflow: hidden; }
                    .product-card:hover { transform: translateY(-8px); box-shadow: 0 10px 20px rgba(25, 135, 84, 0.2) !important; border-color: #198754 !important; }
                    .card-img-top { height: 200px; object-fit: contain; padding: 15px; }
                `}
            </style>

            <header className="bg-success py-4 shadow-sm">
                <div className="container px-4 px-lg-5 my-4">
                    <div className="text-center text-white">
                        <h2 className="fw-bolder">KẾT QUẢ TÌM KIẾM</h2>
                        {queryParam ? (
                            <p className="lead fw-normal text-white-50 mb-0">
                                Tìm thấy <strong>{products.length}</strong> sản phẩm cho từ khóa: "<strong>{queryParam}</strong>"
                            </p>
                        ) : (
                            <p className="lead fw-normal text-white-50 mb-0">Bạn chưa nhập từ khóa tìm kiếm.</p>
                        )}
                    </div>
                </div>
            </header>

            <section className="py-5 bg-light" style={{ minHeight: '60vh' }}>
                <div className="container px-4 px-lg-5 mt-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success mb-3" role="status"></div>
                            <h4 className="text-success">Đang tìm kiếm sản phẩm...</h4>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                            {products.map((product) => {
                                // Lấy biến thể đầu tiên để hiện giá
                                const defaultVariant = product.variants && product.variants[0];

                                return (
                                    <div className="col mb-5" key={product._id}>
                                        <div className="card h-100 shadow-sm border-0 product-card">
                                            
                                            {/* Badge Giảm Giá */}
                                            {defaultVariant?.isSale && (
                                                <div className="badge bg-danger text-white position-absolute" style={{ top: '0.8rem', right: '0.8rem', padding: '0.5em 0.8em', borderRadius: '8px', zIndex: 1 }}>
                                                    GIẢM GIÁ
                                                </div>
                                            )}

                                            <Link to={`/product/${product._id}`}>
                                                {/* CHỖ QUAN TRỌNG: Nối chuỗi BACKEND_URL để hiện ảnh */}
                                                <img 
                                                    className="card-img-top bg-white" 
                                                    src={`${BACKEND_URL}/${product.image}`} 
                                                    alt={product.name} 
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=NNIT+Shop"; }}
                                                />
                                            </Link>
                                            
                                            <div className="card-body p-4 pt-2 bg-white">
                                                <div className="text-center">
                                                    <h6 className="fw-bolder mb-3 text-truncate">
                                                        <Link to={`/product/${product._id}`} className="text-dark text-decoration-none">
                                                            {product.name}
                                                        </Link>
                                                    </h6>
                                                    
                                                    <div className="d-flex justify-content-center small text-warning mb-2">
                                                        <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                        {defaultVariant ? (
                                                            defaultVariant.isSale ? (
                                                                <>
                                                                    <div className="text-muted text-decoration-line-through small">{formatPrice(defaultVariant.price)} ₫</div>
                                                                    <div className="text-danger fw-bold fs-5">{formatPrice(defaultVariant.salePrice)} ₫</div>
                                                                </>
                                                            ) : (
                                                                <div className="text-success fw-bold fs-5">{formatPrice(defaultVariant.price)} ₫</div>
                                                            )
                                                        ) : (
                                                            <span className="text-muted small">Đang cập nhật giá</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="card-footer p-4 pt-0 border-top-0 bg-white">
                                                <div className="text-center">
                                                    <Link to={`/product/${product._id}`} className="btn btn-outline-success mt-auto w-100 fw-bold rounded-pill">
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div> 
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-search-heart text-muted mb-3" style={{ fontSize: '5rem', opacity: 0.3 }}></i>
                            <h4 className="fw-bold text-secondary">Rất tiếc, không tìm thấy kết quả nào!</h4>
                            <p className="text-muted">Nhớ thử lại bằng các từ khóa khác như "Samsung", "iPhone 15" hoặc "Redmi" nhé.</p>
                            <Link to="/" className="btn btn-success rounded-pill px-4 mt-3 shadow-sm">
                                <i className="bi bi-house-door me-2"></i>Quay lại trang chủ
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default SearchPage;