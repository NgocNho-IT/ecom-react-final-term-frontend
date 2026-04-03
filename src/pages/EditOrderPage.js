import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const EditOrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '', email: '', address: '', city: '', state: '', zipcode: '', status: ''
    });

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                if (data.success) {
                    setOrder(data.order);
                    setFormData({
                        fullName: data.order.shippingInfo.fullName,
                        email: data.order.shippingInfo.email,
                        address: data.order.shippingInfo.address,
                        city: data.order.shippingInfo.city,
                        state: data.order.shippingInfo.state,
                        zipcode: data.order.shippingInfo.zipcode,
                        status: data.order.status
                    });
                }
            } catch (error) {
                console.error("Lỗi lấy đơn hàng", error);
            }
        };
        fetchOrder();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'Delivered' : 'Processing') : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/admin/orders/${id}`, formData);
            alert("Cập nhật đơn hàng thành công!");
            navigate('/admin');
        } catch (error) {
            alert("Lỗi cập nhật: " + error.response?.data?.message);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    if (!order) return <div className="text-center mt-5"><h3>Đang tải...</h3></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="card-header bg-success text-white py-3">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-pencil-square me-2"></i>CHỈNH SỬA ĐƠN HÀNG #{order._id.substring(18,24).toUpperCase()}</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">Họ tên khách hàng</label>
                                        <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-secondary small">Email</label>
                                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-secondary small">Địa chỉ giao hàng</label>
                                        <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-secondary small">Thành phố</label>
                                        <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-secondary small">Tỉnh/Thành</label>
                                        <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold text-secondary small">Mã bưu điện</label>
                                        <input type="text" name="zipcode" className="form-control" value={formData.zipcode} onChange={handleChange} />
                                    </div>
                                    <div className="col-12 mt-4">
                                        <div className="form-check form-switch p-3 bg-light rounded-3 border d-flex align-items-center">
                                            <input type="checkbox" name="status" className="form-check-input ms-1" style={{transform: 'scale(1.5)'}} checked={formData.status === 'Delivered'} onChange={handleChange} />
                                            <label className="form-check-label ms-3 fw-bold text-success">Đã giao hàng (Xác nhận hoàn tất)</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 d-flex gap-2">
                                    <button type="submit" className="btn btn-success px-5 fw-bold rounded-pill shadow-sm">LƯU THAY ĐỔI</button>
                                    <Link to="/admin" className="btn btn-outline-secondary px-4 rounded-pill">Hủy bỏ</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-light py-3 border-0">
                            <h6 className="mb-0 fw-bold text-dark"><i className="bi bi-cart-check me-2"></i>SẢN PHẨM ĐÃ ĐẶT</h6>
                        </div>
                        <div className="card-body p-0">
                            <ul className="list-group list-group-flush">
                                {order.orderItems.map((item, idx) => (
                                    <li key={idx} className="list-group-item py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold text-dark">{item.name}</div>
                                                <div className="small">Số lượng: <span className="badge bg-secondary rounded-pill">{item.quantity}</span></div>
                                            </div>
                                            <div className="text-danger fw-bold">{formatPrice(item.price)} ₫</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="card-footer bg-white border-0 p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">TỔNG THANH TOÁN:</span>
                                <h4 className="text-danger fw-bold mb-0">{formatPrice(order.amountPaid)} ₫</h4>
                            </div>
                        </div>
                    </div>
                    <div className="alert alert-info mt-3 rounded-4 border-0 small">
                        <i className="bi bi-info-circle-fill me-2"></i> Bạn lưu ý kiểm tra kỹ địa chỉ trước khi đánh dấu <strong>Đã giao</strong> nhé!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditOrderPage;