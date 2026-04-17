import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const BACKEND_URL = "http://localhost:5000";

const ApplePage = () => {
    const { id } = useParams(); 
    const [products, setProducts] = useState([]);
    const [saleProducts, setSaleProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { setCurrentPage(1); }, [id]);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/products/category/${id}?page=${currentPage}`);
                if (data.success) {
                    setProducts(data.products);
                    // Lọc ra các sản phẩm đang giảm giá của riêng hãng Apple
                    const sales = data.products.filter(p => p.variants && p.variants[0] && p.variants[0].isSale);
                    setSaleProducts(sales);
                    
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

    // Ép Carousel trượt mượt mà
    useEffect(() => {
        let slideInterval;
        if (saleProducts && saleProducts.length > 1) {
            slideInterval = setInterval(() => {
                const nextBtn = document.querySelector('#appleCarousel .carousel-control-next');
                if (nextBtn) nextBtn.click();
            }, 4000); 
        }
        return () => { if (slideInterval) clearInterval(slideInterval); };
    }, [saleProducts]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);
    const handlePageChange = (pageNumber) => { setCurrentPage(pageNumber); window.scrollTo({ top: 400, behavior: 'smooth' }); };
    
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) stars.push(<i key={i} className="bi bi-star-fill text-warning" style={{marginRight: '2px', fontSize: '13px'}}></i>);
            else if (rating >= i - 0.5) stars.push(<i key={i} className="bi bi-star-half text-warning" style={{marginRight: '2px', fontSize: '13px'}}></i>);
            else stars.push(<i key={i} className="bi bi-star-fill text-black-50 opacity-25" style={{marginRight: '2px', fontSize: '13px'}}></i>);
        }
        return stars;
    };

    if (loading && products.length === 0) return (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="spinner-border text-dark"></div></div>);

    return (
        <>
            <style>
                {`
                    html { scroll-behavior: smooth; }
                    :root { --brand-color: #000000; --brand-light: #333333; }
                    .text-brand { color: var(--brand-color) !important; }
                    .btn-outline-brand { border-color: var(--brand-color) !important; color: var(--brand-color) !important; }
                    .btn-outline-brand:hover { background-color: var(--brand-color) !important; color: white !important; }
                    
                    /* PRODUCT CARDS */
                    .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; border-radius: 12px; border: 1px solid #f0f2f5; background-color: #fff; }
                    .product-card:hover { transform: translateY(-6px); box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important; border-color: var(--brand-color) !important; z-index: 2; }
                    .img-wrapper { overflow: hidden; border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 1.5rem; }
                    .product-img { transition: transform 0.4s ease; }
                    .product-card:hover .product-img { transform: scale(1.05); }
                    .badge-hot { background: linear-gradient(45deg, #333, #000); }
                    
                    /* HERO BANNER THEO MÀU HÃNG */
                    .flat-banner-container { background: linear-gradient(120deg, var(--brand-color) 0%, var(--brand-light) 100%); border-radius: 16px; position: relative; margin-top: 1.5rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); overflow: hidden;}
                    .bg-shape-1 { position: absolute; width: 300px; height: 300px; background: rgba(255,255,255,0.06); border-radius: 50%; top: -100px; left: -50px; z-index: 0; }
                    .bg-shape-2 { position: absolute; width: 400px; height: 400px; background: rgba(255,255,255,0.04); border-radius: 50%; bottom: -150px; right: -50px; z-index: 0; }
                    .flat-banner-badge { background-color: #ffc107; color: #000; font-size: 0.75rem; font-weight: 800; padding: 6px 14px; border-radius: 6px; display: inline-block; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                    .flat-banner-title { color: #ffffff; font-weight: 800; font-size: 2.8rem; line-height: 1.25; margin-bottom: 12px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
                    .flat-banner-desc { color: rgba(255, 255, 255, 0.9); font-size: 1.05rem; margin-bottom: 28px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                    .flat-btn-outline { border: 2px solid rgba(255, 255, 255, 0.8); color: #ffffff; padding: 10px 28px; border-radius: 50px; font-weight: 700; font-size: 0.95rem; text-decoration: none; transition: all 0.2s ease; display: inline-block; background: transparent; }
                    .flat-btn-outline:hover { background-color: #ffffff; color: var(--brand-color); }
                    
                    /* CAROUSEL */
                    .carousel-inner { border-radius: 16px; z-index: 1; }
                    .carousel-item { transition: transform 0.6s ease-in-out !important; }
                    .custom-control-btn { width: 44px; height: 44px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; border: 1px solid rgba(255,255,255,0.3); }
                    .custom-control-btn:hover { background-color: rgba(255, 255, 255, 0.9); }
                    .custom-control-btn:hover i { color: var(--brand-color) !important; }
                    .custom-control-btn i { color: #fff; font-size: 1.2rem; transition: color 0.2s ease; }
                    .carousel-control-prev { justify-content: flex-start; padding-left: 20px; width: 10%; z-index: 5; }
                    .carousel-control-next { justify-content: flex-end; padding-right: 20px; width: 10%; z-index: 5; }
                    .custom-indicators { margin-bottom: 15px; z-index: 5; }
                    .custom-indicators [data-bs-target] { width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.4); border: none; margin: 0 6px; transition: all 0.3s ease; }
                    .custom-indicators .active { background-color: #ffffff; transform: scale(1.3); }
                `}
            </style>

            <div className="container">
                <div id="appleCarousel" className="carousel slide flat-banner-container" data-bs-ride="carousel">
                    <div className="bg-shape-1"></div><div className="bg-shape-2"></div>
                    <div className="carousel-indicators custom-indicators">
                        {saleProducts.map((_, index) => (
                            <button key={index} type="button" data-bs-target="#appleCarousel" data-bs-slide-to={index} className={index === 0 ? "active" : ""}></button>
                        ))}
                    </div>

                    <div className="carousel-inner">
                        {saleProducts.length > 0 ? (
                            saleProducts.map((p, index) => {
                                const v = p.variants && p.variants[0];
                                return (
                                    <div key={p._id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                        <div className="row align-items-center" style={{ minHeight: '400px', padding: '2.5rem 4rem' }}>
                                            <div className="col-lg-7 z-1 mb-4 mb-lg-0 pe-lg-4">
                                                <div className="flat-banner-badge"><i className="bi bi-apple me-1"></i> Ưu đãi Apple</div>
                                                <h1 className="flat-banner-title text-truncate">{p.name}</h1>
                                                <p className="flat-banner-desc">{p.description || "Tuyệt tác công nghệ - Trải nghiệm hoàn hảo. Sở hữu ngay siêu phẩm Apple với mức giá tốt nhất."}</p>
                                                {v && (
                                                    <div className="d-flex align-items-center gap-3 mb-4">
                                                        <span className="text-white fw-bolder fs-2">{formatPrice(v.salePrice)} ₫</span>
                                                        <span className="text-white-50 text-decoration-line-through fw-semibold">{formatPrice(v.price)} ₫</span>
                                                    </div>
                                                )}
                                                <Link to={`/product/${p._id}`} className="flat-btn-outline">Xem chi tiết</Link>
                                            </div>
                                            <div className="col-lg-5 text-center z-1">
                                                <img src={`${BACKEND_URL}/${p.image}`} className="img-fluid" style={{ maxHeight: '300px', objectFit: 'contain' }} alt={p.name} onError={(e) => { e.target.src = "https://via.placeholder.com/350x350"; }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="carousel-item active">
                                <div className="row align-items-center" style={{ minHeight: '400px', padding: '2.5rem 4rem' }}>
                                    <div className="col-lg-12 text-center z-1">
                                        <i className="bi bi-apple text-white mb-3" style={{fontSize: '4rem'}}></i>
                                        <h1 className="flat-banner-title">KỶ NGUYÊN APPLE</h1>
                                        <p className="flat-banner-desc text-center">Đẳng cấp khác biệt - Thiết kế dẫn đầu xu hướng.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {saleProducts.length > 1 && (
                        <>
                            <button className="carousel-control-prev d-none d-md-flex" type="button" data-bs-target="#appleCarousel" data-bs-slide="prev">
                                <div className="custom-control-btn"><i className="bi bi-chevron-left text-white"></i></div>
                            </button>
                            <button className="carousel-control-next d-none d-md-flex" type="button" data-bs-target="#appleCarousel" data-bs-slide="next">
                                <div className="custom-control-btn"><i className="bi bi-chevron-right text-white"></i></div>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <section className="py-4 bg-light">
                <div className="container px-4 px-lg-5 mt-2">
                    <div className="d-flex justify-content-between align-items-end mb-4 border-start border-dark border-5 ps-3">
                        <h3 className="fw-bold text-dark mb-0 text-uppercase">{categoryName || "APPLE IPHONE"}</h3>
                        <span className="text-muted small fw-bold bg-white px-3 py-1 rounded-pill shadow-sm border border-dark border-opacity-25">
                            Tổng cộng: <span className="text-dark">{totalItems}</span> sản phẩm
                        </span>
                    </div>

                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
                        {products.length > 0 ? products.map((product) => {
                            const defaultVariant = product.variants && product.variants[0];
                            const isHot = product.sold >= 5;
                            return (
                                <div className="col mb-5" key={product._id}>
                                    <div className="card h-100 shadow-sm border product-card bg-white position-relative">
                                        <div className="position-absolute d-flex flex-column gap-1" style={{ top: '12px', left: '12px', zIndex: 2 }}>
                                            {isHot && <span className="badge badge-hot text-white shadow-sm px-2 py-1 rounded-2"><i className="bi bi-fire me-1"></i>Bán chạy</span>}
                                        </div>
                                        <div className="position-absolute d-flex flex-column gap-1" style={{ top: '12px', right: '12px', zIndex: 2 }}>
                                            {defaultVariant?.isSale && <span className="badge bg-danger text-white shadow-sm px-2 py-1 rounded-2 fw-bold">Giảm sốc</span>}
                                        </div>
                                        <div className="img-wrapper bg-white">
                                            <Link to={`/product/${product._id}`}>
                                                <img className="card-img-top product-img" src={`${BACKEND_URL}/${product.image}`} alt={product.name} style={{ objectFit: 'contain', height: '200px', width: '100%' }} onError={(e) => { e.target.src = "https://via.placeholder.com/200"; }} />
                                            </Link>
                                        </div>
                                        <div className="card-body p-3 text-center d-flex flex-column">
                                            <h6 className="fw-bold mb-2" style={{minHeight:'40px'}}><Link to={`/product/${product._id}`} className="text-dark text-decoration-none">{product.name}</Link></h6>
                                            <div className="d-flex justify-content-center align-items-center mb-3 mt-auto">
                                                <div className="me-2 border-end pe-2 border-secondary border-opacity-25">{renderStars(product.rating)}<span className="text-muted ms-1" style={{ fontSize: '11px' }}>({product.numReviews || 0})</span></div>
                                                <div className="text-muted small" style={{ fontSize: '11px' }}>Đã bán {product.sold || 0}</div>
                                            </div>
                                            <div className="mb-2">
                                                {defaultVariant ? (
                                                    defaultVariant.isSale ? (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <span className="text-danger fw-bolder fs-5 lh-1 mb-1">{formatPrice(defaultVariant.salePrice)} ₫</span>
                                                            <span className="text-muted text-decoration-line-through" style={{fontSize: '12px'}}>{formatPrice(defaultVariant.price)} ₫</span>
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <span className="text-brand fw-bolder fs-5 lh-1 mb-1">{formatPrice(defaultVariant.price)} ₫</span>
                                                            <span className="text-white" style={{fontSize: '12px'}}>_</span>
                                                        </div>
                                                    )
                                                ) : (<span className="text-muted small">Liên hệ báo giá</span>)}
                                            </div>
                                        </div>
                                        <div className="card-footer p-3 pt-0 border-top-0 bg-transparent">
                                            <Link className="btn btn-outline-brand w-100 fw-bold rounded-pill shadow-sm" to={`/product/${product._id}`}>Xem chi tiết</Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : <div className="text-center py-5 w-100"><h4 className="text-muted">Danh mục trống.</h4></div>}
                    </div> 

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4 mb-5">
                            <ul className="pagination gap-2 border-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link text-brand fw-bold border-0 bg-white rounded-pill shadow-sm px-3" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
                                </li>
                                {[...Array(totalPages)].map((_, index) => (
                                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button className={`page-link fw-bold rounded-circle border-0 ${currentPage === index + 1 ? 'bg-brand text-white' : 'text-brand bg-white'}`} style={{ width: '42px', height: '42px' }} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link text-brand fw-bold border-0 bg-white rounded-pill shadow-sm px-3" onClick={() => handlePageChange(currentPage + 1)}>Sau</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};
export default ApplePage;