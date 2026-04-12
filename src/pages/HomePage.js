import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const BACKEND_URL = "http://localhost:5000";

const HomePage = () => {
    const [saleProducts, setSaleProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Lấy dữ liệu sản phẩm từ Backend
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const { data } = await API.get(`/products/home?page=${currentPage}`);
                if (data.success) {
                    setSaleProducts(data.saleProducts);
                    setProducts(data.products);
                    setTotalPages(data.totalPages); 
                    setTotalItems(data.totalItems);
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu trang chủ:", error);
                setLoading(false);
            }
        };

        fetchHomeData();
    }, [currentPage]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 600, behavior: 'smooth' }); 
    };

    // Hàm render sao thông minh (Luôn hiển thị 5 sao để cân bằng UI)
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) {
                stars.push(<i key={i} className="bi bi-star-fill text-warning" style={{marginRight: '2px', fontSize: '13px'}}></i>);
            } else if (rating >= i - 0.5) {
                stars.push(<i key={i} className="bi bi-star-half text-warning" style={{marginRight: '2px', fontSize: '13px'}}></i>);
            } else {
                stars.push(<i key={i} className="bi bi-star-fill text-black-50 opacity-25" style={{marginRight: '2px', fontSize: '13px'}}></i>);
            }
        }
        return stars;
    };

    // Màn hình Loading chuyên nghiệp
    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <h4 className="text-success fw-bold">Đang tải cửa hàng...</h4>
            </div>
        );
    }

    return (
        <>
            {/* CSS CHO HIỆU ỨNG CARD, HOVER ZOOM VÀ BADGE HOT */}
            <style>
                {`
                    .product-card {
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        border-radius: 12px;
                        border: 1px solid #f0f2f5;
                    }
                    .product-card:hover {
                        transform: translateY(-8px);
                        box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                        border-color: #198754 !important;
                        z-index: 2;
                    }
                    .img-wrapper {
                        overflow: hidden;
                        border-top-left-radius: 12px;
                        border-top-right-radius: 12px;
                        padding: 1.5rem;
                        background-color: #ffffff;
                    }
                    .product-img {
                        transition: transform 0.5s ease;
                    }
                    .product-card:hover .product-img {
                        transform: scale(1.08);
                    }
                    .badge-hot {
                        background: linear-gradient(45deg, #ff416c, #ff4b2b);
                        font-weight: bold;
                        letter-spacing: 0.5px;
                    }
                    .product-title {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        min-height: 40px;
                        line-height: 1.4;
                    }
                `}
            </style>

            {/* CAROUSEL GIẢM GIÁ */}
            <div id="saleCarousel" className="carousel slide bg-success py-5 shadow-sm" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {saleProducts.length > 0 ? (
                        saleProducts.map((p, index) => {
                            const v = p.variants && p.variants[0];
                            return (
                                <div key={p._id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                    <div className="container">
                                        <div className="row align-items-center">
                                            <div className="col-md-6 text-white text-center text-md-start">
                                                <h1 className="display-4 fw-bolder">🔥 CƠ HỘI VÀNG</h1>
                                                <h2 className="fw-bold">{p.name}</h2>
                                                <p className="lead">Đang giảm giá cực sốc tại NNIT Shop. Số lượng có hạn!</p>
                                                
                                                {v && (
                                                    <div className="mb-4">
                                                        <span className="text-white-50 text-decoration-line-through fs-4 me-3">{formatPrice(v.price)} ₫</span>
                                                        <span className="text-warning fw-bold fs-2">{formatPrice(v.salePrice)} ₫</span>
                                                    </div>
                                                )}
                                                
                                                <Link to={`/product/${p._id}`} className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-success shadow">MUA NGAY</Link>
                                            </div>
                                            <div className="col-md-6 d-none d-md-block text-center">
                                                <img 
                                                    src={`${BACKEND_URL}/${p.image}`} 
                                                    className="img-fluid" 
                                                    style={{ height: '350px', width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} 
                                                    alt={p.name} 
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/350x350?text=NNIT+Shop"; }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="carousel-item active">
                            <div className="container text-center text-white my-5">
                                <h1 className="display-4 fw-bolder">Mua sắm phong cách</h1>
                                <p className="lead fw-normal text-white-50 mb-0">Khám phá bộ sưu tập điện thoại mới nhất của chúng tôi</p>
                            </div>
                        </div>
                    )}
                </div>
                
                {saleProducts.length > 1 && (
                    <>
                        <button className="carousel-control-prev" type="button" data-bs-target="#saleCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon shadow-sm"></span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#saleCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon shadow-sm"></span>
                        </button>
                    </>
                )}
            </div>

            {/* DANH SÁCH SẢN PHẨM (NÂNG CẤP PREMIUM) */}
            <section className="py-5 bg-light">
                <div className="container px-4 px-lg-5 mt-4">
                    
                    {/* Header Danh sách */}
                    <div className="d-flex justify-content-between align-items-end mb-4 border-start border-success border-5 ps-3">
                        <h3 className="fw-bold text-dark mb-0">KHÁM PHÁ SẢN PHẨM</h3>
                        <span className="text-muted small fw-bold bg-white px-3 py-1 rounded-pill shadow-sm border border-success border-opacity-25">
                            Tổng cộng: <span className="text-success">{totalItems}</span> sản phẩm
                        </span>
                    </div>
                    
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                        {products.map(product => {
                            const defaultVariant = product.variants && product.variants[0];
                            const isHot = product.sold >= 5; // Tự động lên nhãn HOT nếu bán >= 5 chiếc

                            return (
                                <div className="col mb-5" key={product._id}>
                                    <div className="card h-100 shadow-sm border product-card bg-white position-relative">
                                        
                                        {/* HỆ THỐNG NHÃN GÓC TRÁI (BÁN CHẠY) */}
                                        <div className="position-absolute d-flex flex-column gap-1" style={{ top: '12px', left: '12px', zIndex: 2 }}>
                                            {isHot && (
                                                <span className="badge badge-hot text-white shadow-sm px-2 py-1 rounded-2">
                                                    <i className="bi bi-fire me-1"></i>Bán chạy
                                                </span>
                                            )}
                                        </div>

                                        {/* HỆ THỐNG NHÃN GÓC PHẢI (GIẢM GIÁ) */}
                                        <div className="position-absolute d-flex flex-column gap-1" style={{ top: '12px', right: '12px', zIndex: 2 }}>
                                            {defaultVariant?.isSale && (
                                                <span className="badge bg-danger text-white shadow-sm px-2 py-1 rounded-2 fw-bold">
                                                    Giảm sốc
                                                </span>
                                            )}
                                        </div>

                                        {/* ẢNH SẢN PHẨM CÓ ZOOM */}
                                        <div className="img-wrapper bg-white">
                                            <Link to={`/product/${product._id}`}>
                                                <img 
                                                    className="card-img-top product-img" 
                                                    src={`${BACKEND_URL}/${product.image}`} 
                                                    alt={product.name} 
                                                    style={{ objectFit: 'contain', height: '200px', width: '100%' }} 
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x200?text=NNIT+Shop"; }}
                                                />
                                            </Link>
                                        </div>
                                        
                                        <div className="card-body p-3 text-center d-flex flex-column">
                                            {/* TÊN SẢN PHẨM */}
                                            <h6 className="fw-bold mb-2 product-title" title={product.name}>
                                                <Link to={`/product/${product._id}`} className="text-dark text-decoration-none">
                                                    {product.name}
                                                </Link>
                                            </h6>
                                            
                                            {/* KHU VỰC ĐÁNH GIÁ VÀ ĐÃ BÁN (CHUẨN SHOPEE) */}
                                            <div className="d-flex justify-content-center align-items-center mb-3 mt-auto">
                                                <div className="d-flex align-items-center me-2 border-end pe-2 border-secondary border-opacity-25">
                                                    {renderStars(product.rating)}
                                                    <span className="text-muted ms-1" style={{ fontSize: '11px' }}>
                                                        ({product.numReviews || 0})
                                                    </span>
                                                </div>
                                                <div className="text-muted small" style={{ fontSize: '11px' }}>
                                                    Đã bán {product.sold || 0}
                                                </div>
                                            </div>

                                            {/* GIÁ TIỀN */}
                                            <div className="mb-2">
                                                {defaultVariant ? (
                                                    defaultVariant.isSale ? (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <span className="text-danger fw-bolder fs-5 lh-1 mb-1">{formatPrice(defaultVariant.salePrice)} ₫</span>
                                                            <span className="text-muted text-decoration-line-through" style={{fontSize: '12px'}}>{formatPrice(defaultVariant.price)} ₫</span>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <span className="text-success fw-bolder fs-5 lh-1 mb-1">{formatPrice(defaultVariant.price)} ₫</span>
                                                            <span className="text-white" style={{fontSize: '12px'}}>_</span>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-muted small">Liên hệ báo giá</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* NÚT XEM CHI TIẾT */}
                                        <div className="card-footer p-3 pt-0 border-top-0 bg-transparent">
                                            <Link className="btn btn-outline-success w-100 fw-bold rounded-pill shadow-sm" to={`/product/${product._id}`}>
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div> 

                    {/* NÚT BẤM PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <nav aria-label="Page navigation">
                                <ul className="pagination pagination-lg shadow-sm rounded-pill overflow-hidden">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link text-success fw-bold border-0 bg-white" onClick={() => handlePageChange(currentPage - 1)}>
                                            <i className="bi bi-chevron-left me-1"></i>Trước
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button 
                                                className={`page-link fw-bold border-0 ${currentPage === index + 1 ? 'bg-success text-white' : 'text-success bg-white'}`}
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link text-success fw-bold border-0 bg-white" onClick={() => handlePageChange(currentPage + 1)}>
                                            Sau<i className="bi bi-chevron-right ms-1"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                    
                </div>
            </section>
        </>
    );
};

export default HomePage;