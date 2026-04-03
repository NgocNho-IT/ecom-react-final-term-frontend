import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/constants'; // FIX ẢNH TRIỆT ĐỂ

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    
    // State cho Form giao hàng
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setFullName(`${user.lastName} ${user.firstName}`);
            setEmail(user.email);
        }
        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await API.get('/cart');
            if (data.success && data.cart.items.length > 0) {
                setCartItems(data.cart.items);
                // Tính tổng
                const sum = data.cart.items.reduce((acc, item) => {
                    const variant = item.productId.variants.find(v => v._id === item.variantId);
                    const price = variant ? (variant.isSale ? variant.salePrice : variant.price) : 0;
                    return acc + (price * item.quantity);
                }, 0);
                setTotal(sum);
            } else {
                alert("Giỏ hàng trống! Hãy mua sắm thêm.");
                navigate('/');
            }
        } catch (error) {
            console.error("Lỗi lấy giỏ hàng checkout:", error);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    const handlePlaceOrder = async (e) => {
        e.preventDefault(); 
        try {
            const shippingInfo = { fullName, email, address, city };
            const amountPaid = total;

            const { data } = await API.post('/orders/checkout', { shippingInfo, amountPaid });
            
            if (data.success) {
                // CHỖ QUAN TRỌNG NHẤT: Báo cho Header biết giỏ hàng đã trống để reset số đỏ về 0
                window.dispatchEvent(new Event('cartUpdated')); 

                alert("🎉 Đơn hàng đã được ghi nhận. Cảm ơn Nhớ đã ủng hộ NNIT Shop!");
                navigate('/orders'); // Chuyển về trang lịch sử đơn hàng cho chuyên nghiệp
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi đặt hàng!");
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row">
                {/* Form nhập thông tin */}
                <div className="col-md-7">
                    <div className="card shadow-sm border-success border-opacity-25 rounded-3">
                        <div className="card-header bg-success text-white fw-bold py-3 text-center">
                            <i className="bi bi-truck me-2"></i>THÔNG TIN GIAO HÀNG
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handlePlaceOrder} id="order-form">
                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Họ và tên người nhận</label>
                                    <input type="text" className="form-control border-success" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Email liên hệ</label>
                                    <input type="email" className="form-control border-success" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Địa chỉ chi tiết</label>
                                    <input type="text" className="form-control border-success" placeholder="Số nhà, tên đường..." value={address} onChange={e => setAddress(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Tỉnh/Thành phố</label>
                                    <input type="text" className="form-control border-success" value={city} onChange={e => setCity(e.target.value)} required />
                                </div>
                                
                                <button type="submit" className="btn btn-success w-100 mt-4 fw-bold py-3 shadow d-md-none rounded-pill">
                                    <i className="bi bi-check-circle-fill me-2"></i> HOÀN TẤT ĐẶT HÀNG
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="col-md-5 mt-4 mt-md-0">
                    <div className="card shadow-sm border-success rounded-3">
                        <div className="card-header bg-light fw-bold text-success py-3 text-center">
                            <i className="bi bi-cart-check me-2"></i>ĐƠN HÀNG CỦA BẠN
                        </div>
                        <div className="card-body">
                            {cartItems.map((item) => {
                                const variant = item.productId.variants.find(v => v._id === item.variantId);
                                if (!variant) return null;
                                return (
                                    <div key={item.variantId} className="d-flex mb-3 align-items-center border-bottom pb-3">
                                        {/* THÊM ẢNH ĐẠI DIỆN CHO CHUYÊN NGHIỆP */}
                                        <img 
                                            src={getImageUrl(item.productId.image)} 
                                            alt={item.productId.name} 
                                            className="rounded me-3 border" 
                                            style={{ width: '60px', height: '60px', objectFit: 'contain' }} 
                                        />
                                        <div className="flex-grow-1">
                                            <div className="fw-bold small">{item.productId.name}</div>
                                            <small className="text-muted">{variant.colorName} | {variant.storageCapacity}</small><br/>
                                            <span className="badge bg-success opacity-75">x {item.quantity}</span>
                                        </div>
                                        <div className="text-end">
                                            <span className="text-danger fw-bold small">
                                                {formatPrice(variant.isSale ? variant.salePrice : variant.price)} ₫
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="d-flex justify-content-between mt-4">
                                <h5 className="fw-bold">TỔNG CỘNG:</h5>
                                <h5 className="text-danger fw-bold fs-3">{formatPrice(total)} ₫</h5>
                            </div>
                            
                            <button type="submit" form="order-form" className="btn btn-success w-100 mt-4 fw-bold py-3 shadow d-none d-md-block rounded-pill">
                                <i className="bi bi-check-circle-fill me-2"></i> HOÀN TẤT ĐẶT HÀNG
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;