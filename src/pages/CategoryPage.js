import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const BACKEND_URL = "http://localhost:5000";

const CategoryPage = () => {
    const { id } = useParams(); 
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [id]);

    // Lấy dữ liệu sản phẩm theo danh mục từ Backend
    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/products/category/${id}?page=${currentPage}`);
                if (data.success) {
                    setProducts(data.products);
                    setCategoryName(data.categoryName);
                    setTotalPages(data.totalPages); 
                    setTotalItems(data.totalItems);
                }
            } catch (error) {
                console.error("Lỗi load danh mục:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [id, currentPage]); 

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 300, behavior: 'smooth' }); 
    };

    // Hàm render sao thông minh (Đồng bộ với HomePage)
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

    // Màn hình Loading chuyên nghiệp (Đồng bộ với HomePage)
    if (loading && products.length === 0) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <h4 className="text-success fw-bold">Đang tải danh mục sản phẩm...</h4>
            </div>
        );
    }

    return (
        <>
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
                    .bg-nnit-header { 
                        background-color: #198754; 
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

            <header className="bg-nnit-header py-5 shadow-sm">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder text-uppercase">{categoryName || "SẢN PHẨM"}</h1> 
                        <p className="lead fw-normal text-white-50 mb-0">Hiển thị {totalItems} sản phẩm chất lượng cao</p>
                    </div>
                </div>
            </header>

            <section className="py-5 bg-light">
                <div className="container px-4 px-lg-5 mt-4">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {products.length > 0 ? products.map((product) => {
                            const defaultVariant = product.variants && product.variants[0];
                            const isHot = product.sold >= 5;

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
                                            <h6 className="fw-bold mb-2 product-title" title={product.name}>
                                                <Link to={`/product/${product._id}`} className="text-dark text-decoration-none">
                                                    {product.name}
                                                </Link>
                                            </h6>
                                            
                                            {/* ĐÁNH GIÁ VÀ ĐÃ BÁN (CHUẨN SHOPEE) */}
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
                                        
                                        <div className="card-footer p-3 pt-0 border-top-0 bg-transparent">
                                            <Link className="btn btn-outline-success w-100 fw-bold rounded-pill shadow-sm" to={`/product/${product._id}`}>
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-5 w-100">
                                <h4 className="text-muted">Danh mục này hiện đang trống.</h4>
                                <Link to="/" className="btn btn-success mt-2 rounded-pill px-4 shadow-sm">Xem sản phẩm khác</Link>
                            </div>
                        )}

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

export default CategoryPage;