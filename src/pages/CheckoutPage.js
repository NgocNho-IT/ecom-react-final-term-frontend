import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    
    // State Form giao hàng
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState(''); 
    const [address, setAddress] = useState('');
    const [note, setNote] = useState('');
    
    // State Thanh toán
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [isPaid, setIsPaid] = useState(false);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // ==========================================
    // THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA NHỚ
    const BANK_ID = "VCB"; 
    const ACCOUNT_NO = "1049565430"; 
    const ACCOUNT_NAME = "DANG NGOC NHO"; 
    
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${total}&addInfo=Thanh toan don hang NNIT Shop&accountName=${ACCOUNT_NAME}`;
    // ==========================================

    useEffect(() => {
        if (user) {
            setFullName(`${user.lastName} ${user.firstName}`);
        }
        fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await API.get('/cart');
            if (data.success && data.cart.items.length > 0) {
                setCartItems(data.cart.items);
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

        if (paymentMethod === 'QR' && !isPaid) {
            alert("Vui lòng tick chọn 'Tôi đã chuyển khoản thành công' để hoàn tất đơn hàng!");
            return;
        }

        try {
            const shippingInfo = { 
                fullName, 
                email: user?.email || "khachhang@nnit.com", 
                address: `${address} - SĐT: ${phone}`, 
                city: "Đà Nẵng" 
            };
            
            const amountPaid = total;

            const { data } = await API.post('/orders/checkout', { 
                shippingInfo, 
                amountPaid,
                paymentMethod,
                isPaid: paymentMethod === 'QR' ? isPaid : false,
                note
            });
            
            if (data.success) {
                window.dispatchEvent(new Event('cartUpdated')); 
                alert("Đơn hàng đã được đặt thành công. Cảm ơn bạn đã ủng hộ NNIT Shop!");
                navigate('/orders');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi đặt hàng!");
        }
    };

    return (
        <div className="checkout-page-root" style={{ 
            backgroundColor: '#f4f6f9', 
            minHeight: '100vh', 
            paddingTop: '110px', /* Tăng padding để né Navbar */
            paddingBottom: '60px',
            position: 'relative',
            zIndex: 1 /* Ép z-index thấp để Menu (z-index 1050) luôn nằm trên */
        }}>
            
            <style>
                {`
                    /* Khử bóng đổ quá mạnh và animation gây lỗi đè menu */
                    .checkout-card { 
                        border: none; 
                        border-radius: 16px; 
                        box-shadow: 0 2px 12px rgba(0,0,0,0.06); 
                        background: #fff;
                    }
                    .form-control { border-radius: 10px; padding: 12px; border: 1px solid #dee2e6; }
                    .form-control:focus { box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.1); border-color: #198754; }
                    
                    .payment-radio { 
                        border: 1px solid #dee2e6; 
                        padding: 14px; 
                        border-radius: 12px; 
                        width: 100%; 
                        cursor: pointer; 
                        transition: all 0.2s ease;
                    }
                    .payment-radio.active { 
                        border-color: #198754; 
                        background-color: #f8fffb; 
                        box-shadow: 0 0 0 1px #198754;
                    }
                    
                    .product-checkout-item { 
                        border-bottom: 1px solid #f8f9fa; 
                        padding-bottom: 12px; 
                        margin-bottom: 12px; 
                    }
                    .product-checkout-item:last-child { border-bottom: none; }
                    
                    /* Cố định cột phải khi cuộn chuột trên PC */
                    @media (min-width: 992px) {
                        .sticky-summary {
                            position: sticky;
                            top: 110px;
                            z-index: 5;
                        }
                    }
                `}
            </style>

            <div className="container">
                <div className="row g-4">
                    {/* BÊN TRÁI: NHẬP LIỆU */}
                    <div className="col-lg-7">
                        {/* Khối thông tin khách hàng */}
                        <div className="card checkout-card mb-4">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                    <i className="bi bi-geo-alt-fill text-success me-2"></i>
                                    Thông tin giao hàng
                                </h5>
                                <form id="order-form" onSubmit={handlePlaceOrder}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-muted small fw-bold">Họ và tên người nhận</label>
                                            <input type="text" className="form-control" placeholder="Ví dụ: Đặng Ngọc Nhớ" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label text-muted small fw-bold">Số điện thoại</label>
                                            <input type="text" className="form-control" placeholder="0xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">Địa chỉ nhận hàng chính xác</label>
                                        <input type="text" className="form-control" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." value={address} onChange={e => setAddress(e.target.value)} required />
                                    </div>
                                    <div className="mb-0">
                                        <label className="form-label text-muted small fw-bold">Ghi chú thêm (Nếu có)</label>
                                        <textarea className="form-control" rows="2" placeholder="Ghi chú về thời gian giao hoặc vị trí nhà..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Khối phương thức thanh toán */}
                        <div className="card checkout-card">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                    <i className="bi bi-credit-card-fill text-success me-2"></i>
                                    Phương thức thanh toán
                                </h5>
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div className={`payment-radio ${paymentMethod === 'COD' ? 'active' : ''}`} onClick={() => setPaymentMethod('COD')}>
                                            <div className="form-check m-0">
                                                <input className="form-check-input" type="radio" name="payment" id="payCOD" checked={paymentMethod === 'COD'} readOnly />
                                                <label className="form-check-label fw-bold cursor-pointer" htmlFor="payCOD">Thanh toán tiền mặt</label>
                                                <p className="text-muted small mb-0 mt-1">Trả tiền khi nhận hàng (COD)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className={`payment-radio ${paymentMethod === 'QR' ? 'active' : ''}`} onClick={() => setPaymentMethod('QR')}>
                                            <div className="form-check m-0">
                                                <input className="form-check-input" type="radio" name="payment" id="payQR" checked={paymentMethod === 'QR'} readOnly />
                                                <label className="form-check-label fw-bold cursor-pointer" htmlFor="payQR">Chuyển khoản VietQR</label>
                                                <p className="text-muted small mb-0 mt-1">Quét mã nhanh qua App Bank</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BÊN PHẢI: TÓM TẮT & QR */}
                    <div className="col-lg-5">
                        <div className="sticky-summary">
                            <div className="card checkout-card">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4">Chi tiết đơn hàng</h5>
                                    
                                    <div className="mb-4" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        {cartItems.map((item) => {
                                            const variant = item.productId.variants.find(v => v._id === item.variantId);
                                            if (!variant) return null;
                                            return (
                                                <div key={item.variantId} className="product-checkout-item d-flex justify-content-between align-items-center">
                                                    <div style={{ maxWidth: '70%' }}>
                                                        <h6 className="mb-0 fw-bold text-dark small">{item.productId.name}</h6>
                                                        <small className="text-muted">{variant.color} | {variant.storageCapacity}</small>
                                                        <div className="small text-success">Số lượng: {item.quantity}</div>
                                                    </div>
                                                    <span className="fw-bold text-dark">
                                                        {formatPrice((variant.isSale ? variant.salePrice : variant.price) * item.quantity)}đ
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-4">
                                        <h5 className="fw-bold text-dark mb-0">Thành tiền:</h5>
                                        <h4 className="text-danger fw-bolder mb-0">{formatPrice(total)} đ</h4>
                                    </div>

                                    {/* PHẦN QUÉT MÃ QR */}
                                    {paymentMethod === 'QR' && (
                                        <div className="text-center bg-light p-3 rounded-4 mb-4 border border-success border-opacity-25">
                                            <p className="small text-muted mb-2 fw-bold">Mời bạn quét mã để thanh toán:</p>
                                            <img src={qrUrl} alt="QR Code" className="img-fluid rounded-3 shadow-sm mb-3" style={{ maxWidth: '180px', border: '4px solid #fff' }} />
                                            
                                            <div className="form-check text-start p-2 bg-white rounded-3 border d-flex align-items-center justify-content-center">
                                                <input className="form-check-input mt-0 me-2" type="checkbox" id="confirmPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                                                <label className="form-check-label text-danger small fw-bold" htmlFor="confirmPaid" style={{ cursor: 'pointer' }}>
                                                    Tôi đã bấm chuyển khoản thành công
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <button type="submit" form="order-form" className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm mb-3">
                                        <i className="bi bi-bag-check-fill me-2"></i>
                                        HOÀN TẤT ĐẶT HÀNG
                                    </button>
                                    
                                    <div className="text-center">
                                        <Link to="/cart" className="text-decoration-none text-muted small fw-bold">
                                            <i className="bi bi-arrow-left me-1"></i> Quay lại sửa giỏ hàng
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;