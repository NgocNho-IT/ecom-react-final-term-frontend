import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { getImageUrl } from '../utils/constants'; // Fix lỗi ảnh cổng 3000

const CategoryPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState(''); // Tên danh mục (iPhone, Samsung...)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                // Gọi API lấy sản phẩm và thông tin danh mục
                const { data } = await API.get(`/products/category/${id}`);
                if (data.success) {
                    setProducts(data.products);
                    setCategoryName(data.categoryName); // Lấy tên từ DB đổ vào đây
                }
            } catch (error) {
                console.error("Lỗi load danh mục:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
        window.scrollTo(0, 0); // Cuộn lên đầu trang
    }, [id]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price || 0);

    if (loading) return <div className="text-center mt-5 mb-5 py-5"><h3 className="text-success">Đang tải dữ liệu...</h3></div>;

    return (
        <>
            <style>
                {`
                    .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 12px; overflow: hidden; }
                    .product-card:hover { transform: translateY(-8px); box-shadow: 0 10px 20px rgba(25, 135, 84, 0.2) !important; border-color: #198754 !important; }
                    .bg-nnit-header { background-color: #198754; }
                `}
            </style>

            {/* HEADER - HIỆN TÊN DANH MỤC TỪ DB */}
            <header className="bg-nnit-header py-5 shadow-sm">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        {/* HIỆN TÊN DANH MỤC Ở ĐÂY */}
                        <h1 className="display-4 fw-bolder text-uppercase">{categoryName || "SẢN PHẨM"}</h1> 
                        <p className="lead fw-normal text-white-50 mb-0">Danh sách sản phẩm thuộc dòng {categoryName}</p>
                    </div>
                </div>
            </header>

            <section className="py-5 bg-light">
                <div className="container px-4 px-lg-5 mt-5">
                    <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">

                        {products.length > 0 ? products.map((product) => {
                            // Lấy biến thể đầu tiên để hiện giá (tương đương .first trong Django)
                            const defaultVariant = product.variants && product.variants[0];

                            return (
                                <div className="col mb-5" key={product._id}>
                                    <div className="card h-100 shadow-sm border-success border-opacity-25 product-card">
                                        
                                        {/* Badge Giảm Giá */}
                                        {defaultVariant?.isSale && (
                                            <div className="badge bg-danger text-white position-absolute" 
                                                 style={{ top: '0.5rem', right: '0.5rem', padding: '0.5em 0.8em', fontSize: '0.85rem', zIndex: 1 }}>
                                                Giảm giá
                                            </div>
                                        )}

                                        <Link to={`/product/${product._id}`}>
                                            {/* DÙNG getImageUrl ĐỂ FIX ẢNH CỔNG 3000 */}
                                            <img 
                                                className="card-img-top p-3" 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name} 
                                                style={{ objectFit: 'contain', height: '200px', width: '100%', background: '#fff' }} 
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=NNIT+Shop"; }}
                                            />
                                        </Link>
                                        
                                        <div className="card-body p-4 pt-2 bg-white text-center">
                                            <h6 className="fw-bolder mb-3 text-truncate">
                                                <Link to={`/product/${product._id}`} className="text-dark text-decoration-none">
                                                    {product.name}
                                                </Link>
                                            </h6>
                                            
                                            <div className="d-flex justify-content-center small text-warning mb-2">
                                                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                                            </div>

                                            <div className="price-box">
                                                {defaultVariant ? (
                                                    defaultVariant.isSale ? (
                                                        <>
                                                            <span className="text-muted text-decoration-line-through small me-2">{formatPrice(defaultVariant.price)} ₫</span>
                                                            <span className="text-danger fw-bold fs-5">{formatPrice(defaultVariant.salePrice)} ₫</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-success fw-bold fs-5">{formatPrice(defaultVariant.price)} ₫</span>
                                                    )
                                                ) : (
                                                    <span className="text-muted small">Đang cập nhật giá</span>
                                                )}
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
                        }) : (
                            <div className="text-center py-5 w-100">
                                <h4 className="text-muted">Danh mục này hiện đang trống.</h4>
                                <Link to="/" className="btn btn-success mt-2 rounded-pill px-4">Xem sản phẩm khác</Link>
                            </div>
                        )}

                    </div> 
                </div>
            </section>
        </>
    );
};

export default CategoryPage;