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

    if (loading) return <div className="text-center mt-5 mb-5"><h3 className="text-success">Đang tải cửa hàng...</h3></div>;

    return (
        <>
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

            {/* DANH SÁCH SẢN PHẨM CÓ PHÂN TRANG */}
            <section className="py-5 bg-light">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="d-flex justify-content-between align-items-end mb-4 border-start border-success border-5 ps-3">
                        <h3 className="fw-bold text-dark mb-0">DANH SÁCH SẢN PHẨM</h3>
                        <span className="text-muted small fw-bold">Tổng cộng: {totalItems} sản phẩm</span>
                    </div>
                    
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                        {products.map(product => {
                            const defaultVariant = product.variants && product.variants[0];

                            return (
                                <div className="col mb-5" key={product._id}>
                                    <div className="card h-100 shadow-sm border-0 product-card rounded-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
                                        
                                        {defaultVariant?.isSale && (
                                            <div className="badge bg-danger text-white position-absolute" 
                                                 style={{ top: '0.8rem', right: '0.8rem', padding: '0.5em 0.8em', fontSize: '0.75rem', zIndex: 1, borderRadius: '8px' }}>
                                                GIẢM SỐC
                                            </div>
                                        )}

                                        <Link to={`/product/${product._id}`}>
                                            <img 
                                                className="card-img-top p-3 bg-white" 
                                                src={`${BACKEND_URL}/${product.image}`} 
                                                alt={product.name} 
                                                style={{ objectFit: 'contain', height: '200px', width: '100%' }} 
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/200x200?text=NNIT+Shop"; }}
                                            />
                                        </Link>
                                        
                                        <div className="card-body p-4 pt-2 bg-white">
                                            <div className="text-center">
                                                <h6 className="fw-bold mb-3 text-truncate">
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
                                                        <div className="text-muted small">Liên hệ báo giá</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="card-footer p-4 pt-0 border-top-0 bg-white">
                                            <div className="text-center">
                                                <Link className="btn btn-outline-success mt-auto w-100 fw-bold rounded-pill" to={`/product/${product._id}`}>
                                                    Xem chi tiết
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div> 

                    {/* NÚT BẤM PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav aria-label="Page navigation">
                                <ul className="pagination pagination-lg shadow-sm rounded-pill overflow-hidden">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link text-success fw-bold" onClick={() => handlePageChange(currentPage - 1)}>
                                            &laquo; Trước
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button 
                                                className={`page-link fw-bold ${currentPage === index + 1 ? 'bg-success border-success text-white' : 'text-success'}`}
                                                onClick={() => handlePageChange(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link text-success fw-bold" onClick={() => handlePageChange(currentPage + 1)}>
                                            Sau &raquo;
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