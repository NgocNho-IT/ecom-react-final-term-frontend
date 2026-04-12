import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/constants'; 

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const { data } = await API.get('/cart');
            if (data.success) {
                setCartItems(data.cart.items);
            }
            setLoading(false);
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng:", error);
            setLoading(false);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const variant = item.productId?.variants?.find(v => v._id.toString() === item.variantId.toString());
            if (!variant) return total;
            const price = variant.isSale ? variant.salePrice : variant.price;
            return total + (price * item.quantity);
        }, 0);
    };
  
    const handleUpdateQuantity = async (variantId, newQuantity) => {
        try {
            await API.put('/cart/update', { variantId, quantity: newQuantity });
            setCartItems(cartItems.map(item => item.variantId === variantId ? { ...item, quantity: newQuantity } : item));
            window.dispatchEvent(new Event('cartUpdated')); 
        } catch (error) {
            alert("Lỗi cập nhật số lượng!");
        }
    };

    const handleRemoveItem = async (variantId) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ?")) {
            try {
                await API.delete(`/cart/remove/${variantId}`);
                setCartItems(cartItems.filter(item => item.variantId !== variantId));
                window.dispatchEvent(new Event('cartUpdated')); 
            } catch (error) {
                alert("Lỗi xóa sản phẩm!");
            }
        }
    };

    if (loading) return <div className="text-center mt-5 mb-5"><h3>Đang tải giỏ hàng...</h3></div>;

    return (
        <>
            <header className="bg-success py-5">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">Giỏ hàng của bạn</h1>
                        <p className="lead fw-normal text-white-50 mb-0">Kiểm tra lại sản phẩm trước khi thanh toán</p>
                    </div>
                </div>
            </header>

            <div className="container mt-5 mb-5" style={{ minHeight: '400px' }}>
                {cartItems.length > 0 ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {cartItems.map((item) => {
                                const variant = item.productId?.variants?.find(v => v._id === item.variantId);
                                if (!variant) return null;

                                return (
                                    <div key={item.variantId} className="card mb-4 shadow-sm border-success border-opacity-25">
                                        <div className="row g-0 align-items-center">
                                            <div className="col-md-3 text-center">
                                                <img 
                                                    src={getImageUrl(item.productId.image)} 
                                                    className="img-fluid rounded-start p-3" 
                                                    alt={item.productId.name} 
                                                    style={{ maxHeight: '180px', objectFit: 'contain' }} 
                                                />
                                            </div>
                                            <div className="col-md-9">
                                                <div className="card-body">
                                                    <h5 className="card-title fw-bold text-dark">{item.productId.name}</h5>
                                                    
                                                    <p className="text-muted small mb-2">
                                                        Màu sắc: <strong className="text-dark">{variant.colorName}</strong> | 
                                                        Bộ nhớ: <strong className="text-dark">{variant.storageCapacity}</strong> | 
                                                        Bản: <strong className="text-dark">{variant.network}</strong>
                                                    </p>

                                                    {variant.isSale ? (
                                                        <p className="mb-3">
                                                            <span className="text-danger fw-bold fs-5">{formatPrice(variant.salePrice)} ₫</span>
                                                            <span className="text-muted text-decoration-line-through ms-2 small">{formatPrice(variant.price)} ₫</span>
                                                        </p>
                                                    ) : (
                                                        <p className="mb-3"><span className="text-success fw-bold fs-5">{formatPrice(variant.price)} ₫</span></p>
                                                    )}

                                                    <div className="row align-items-center">
                                                        <div className="col-auto">
                                                            <label className="fw-bold">Số lượng:</label>
                                                        </div>
                                                        {/* SỬA LOGIC SỐ LƯỢNG Ở ĐÂY */}
                                                        <div className="col-auto d-flex align-items-center gap-2">
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-sm border-success text-center fw-bold" 
                                                                style={{ width: '70px' }}
                                                                min="1" 
                                                                max={variant.stock > 0 ? variant.stock : 1}
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    let val = Number(e.target.value);
                                                                    if (val > variant.stock) val = variant.stock;
                                                                    if (val < 1) val = 1;
                                                                    handleUpdateQuantity(item.variantId, val);
                                                                }}
                                                                disabled={variant.stock === 0}
                                                            />
                                                            {variant.stock === 0 && <span className="badge bg-danger">Hết hàng</span>}
                                                        </div>

                                                        <div className="col-auto ms-auto">
                                                            <button onClick={() => handleRemoveItem(item.variantId)} className="btn btn-sm btn-outline-danger delete-product">
                                                                <i className="bi bi-trash"></i> Xóa
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="card shadow-sm border-0 bg-light mt-4">
                                <div className="card-body p-4 text-end">
                                    <h4 className="mb-3">Tổng thanh toán: <span className="text-danger fw-bold ms-2">{formatPrice(calculateTotal())} ₫</span></h4>
                                    <Link to="/" className="btn btn-outline-secondary px-4 me-2">Tiếp tục mua sắm</Link>
                                    <Link to="/checkout" className="btn btn-success px-5 fw-bold">
                                        <i className="bi bi-credit-card me-2"></i> TIẾP TỤC ĐẶT HÀNG
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-cart-x text-muted" style={{ fontSize: '5rem' }}></i>
                        <h3 className="text-muted mt-3 fw-bold">Giỏ hàng của bạn đang trống!</h3>
                        <p className="text-muted">Bạn chưa chọn sản phẩm nào vào giỏ hàng.</p>
                        <Link to="/" className="btn btn-success mt-3 px-4 py-2">Khám phá sản phẩm ngay</Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartPage;