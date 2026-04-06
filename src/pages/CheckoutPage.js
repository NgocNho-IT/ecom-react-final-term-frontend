import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/constants'; 

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
    // THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA NHỚ (ĐÃ CẬP NHẬT VCB)
    const BANK_ID = "VCB"; 
    const ACCOUNT_NO = "1049565430"; 
    const ACCOUNT_NAME = "DANG NGOC NHO"; 
    
    // API tạo mã QR tự động từ VietQR
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

        // Ràng buộc nếu chọn QR thì phải tick xác nhận
        if (paymentMethod === 'QR' && !isPaid) {
            alert("Vui lòng tick chọn 'Tôi đã chuyển khoản thành công' để hoàn tất đơn hàng!");
            return;
        }

        try {
            const shippingInfo = { fullName, email: "khachhang@nnit.com", address: `${address} - SĐT: ${phone}`, city: "Đà Nẵng" };
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
        <div className="container mt-5 mb-5">
            <div className="row g-4">
                {/* CỘT TRÁI - THÔNG TIN VÀ PHƯƠNG THỨC THANH TOÁN */}
                <div className="col-md-7">
                    {/* Block Thông tin giao hàng */}
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Thông tin giao hàng</h5>
                            <form id="order-form" onSubmit={handlePlaceOrder}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Họ và tên</label>
                                    <input type="text" className="form-control rounded-3" placeholder="Nhập tên" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Số điện thoại</label>
                                    <input type="text" className="form-control rounded-3" placeholder="0xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Địa chỉ nhận hàng</label>
                                    <input type="text" className="form-control rounded-3" placeholder="Số nhà, đường, phường..." value={address} onChange={e => setAddress(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Ghi chú</label>
                                    <textarea className="form-control rounded-3" rows="2" placeholder="Lời nhắn tới shop..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Block Phương thức thanh toán */}
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Phương thức thanh toán</h5>
                            <div className="d-flex gap-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="payment" id="payCOD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                    <label className="form-check-label" htmlFor="payCOD">
                                        Thanh toán COD
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="payment" id="payQR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
                                    <label className="form-check-label" htmlFor="payQR">
                                        Chuyển khoản QR
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - TÓM TẮT ĐƠN VÀ QR CODE */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Đơn hàng của bạn</h5>
                            
                            {/* Danh sách SP */}
                            <div className="mb-4">
                                {cartItems.map((item) => {
                                    const variant = item.productId.variants.find(v => v._id === item.variantId);
                                    if (!variant) return null;
                                    return (
                                        <div key={item.variantId} className="d-flex justify-content-between mb-2">
                                            <span className="text-muted small">
                                                {item.productId.name} {variant.storageCapacity} x {item.quantity}
                                            </span>
                                            <span className="fw-bold small text-dark">
                                                {formatPrice((variant.isSale ? variant.salePrice : variant.price) * item.quantity)} đ
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <hr className="text-muted opacity-25" />
                            
                            {/* Tổng cộng */}
                            <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                                <h5 className="fw-bold text-danger mb-0">Tổng cộng:</h5>
                                <h5 className="text-danger fw-bold mb-0">{formatPrice(total)} VNĐ</h5>
                            </div>

                            {/* KHU VỰC HIỂN THỊ MÃ QR KHI CHỌN CHUYỂN KHOẢN */}
                            {paymentMethod === 'QR' && (
                                <div className="text-center bg-light p-3 rounded-4 mb-4 border">
                                    <p className="small text-muted mb-2">Quét mã QR để thanh toán:</p>
                                    <img src={qrUrl} alt="QR Code Thanh Toán" className="img-fluid rounded mb-3" style={{ maxWidth: '200px' }} />
                                    
                                    <div className="form-check text-start p-2 bg-white rounded border d-flex align-items-center">
                                        <input className="form-check-input ms-2 mt-0 me-2" type="checkbox" id="confirmPaid" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
                                        <label className="form-check-label text-danger small pt-1" htmlFor="confirmPaid">
                                            Tôi đã chuyển khoản thành công
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Các nút hành động */}
                            <button type="submit" form="order-form" className="btn btn-danger w-100 py-3 rounded-pill fw-bold mb-3 shadow-sm" style={{ backgroundColor: '#198754', border: 'none' }}>
                                Hoàn tất đặt hàng
                            </button>
                            
                            <div className="text-center">
                                <Link to="/cart" className="text-decoration-none text-muted small">Quay lại giỏ hàng</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;