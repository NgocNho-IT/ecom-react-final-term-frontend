import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    return (
        <div className="col mb-5">
            <div className="card h-100 shadow-sm border-0 product-card">
                {defaultVariant && defaultVariant.isSale && (
                    <div className="badge bg-danger text-white position-absolute" style={{ top: '0.5rem', right: '0.5rem', zIndex: 1 }}>
                        Giảm giá
                    </div>
                )}
                
                <Link to={`/product/${product._id}`} className="text-center p-3">
                    <img className="card-img-top object-fit-contain" src={product.image} alt={product.name} style={{ height: '200px' }} />
                </Link>
                
                <div className="card-body p-4 text-center">
                    <h5 className="fw-bolder product-title">
                        <Link to={`/product/${product._id}`} className="text-dark text-decoration-none">
                            {product.name}
                        </Link>
                    </h5>

                    <div className="price-area mt-3">
                        {defaultVariant ? (
                            defaultVariant.isSale ? (
                                <>
                                    <span className="text-muted text-decoration-line-through me-2">
                                        {formatPrice(defaultVariant.price)} ₫
                                    </span>
                                    <span className="text-danger fw-bold fs-5">
                                        {formatPrice(defaultVariant.salePrice)} ₫
                                    </span>
                                </>
                            ) : (
                                <span className="text-success fw-bold fs-5">
                                    {formatPrice(defaultVariant.price)} ₫
                                </span>
                            )
                        ) : (
                            <span className="text-muted">Đang cập nhật giá</span>
                        )}
                    </div>
                </div>
                
                <div className="card-footer p-4 pt-0 border-top-0 bg-transparent text-center">
                    <Link className="btn btn-outline-success mt-auto w-100 fw-bold" to={`/product/${product._id}`}>
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;