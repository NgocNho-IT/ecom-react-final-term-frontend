import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                if (data.success) setOrder(data.order);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    if (loading) return <div className="text-center mt-5"><h3>Đang tải chi tiết đơn hàng...</h3></div>;
    if (!order) return <div className="text-center mt-5"><h3>Không tìm thấy đơn hàng!</h3></div>;

    return (
        <>
            <header className="bg-success py-5">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">Chi tiết đơn hàng</h1>
                        <p className="lead fw-normal text-white-50 mb-0">Mã đơn: #{order._id}</p>
                    </div>
                </div>
            </header>

            <div className="container mt-5 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-4 mb-4">
                        <div className="card shadow-sm border-success border-opacity-25 h-100">
                            <div className="card-header bg-light fw-bold text-success">THÔNG TIN GIAO HÀNG</div>
                            <div className="card-body">
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Người nhận:</p>
                                <p className="fw-bold fs-5">{order.shippingInfo.fullName}</p>
                                
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Địa chỉ:</p>
                                <p className="mb-0">{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                                <hr />
                                <p className="mb-1 text-muted small text-uppercase fw-bold">Ngày đặt:</p>
                                <p>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card shadow-sm border-success">
                            <div className="card-header bg-success text-white fw-bold d-flex justify-content-between">
                                <span>DANH SÁCH SẢN PHẨM</span>
                                <span>
                                    {order.status === 'Delivered' ? (
                                        <span className="badge bg-light text-success">Đã giao hàng</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Đang xử lý</span>
                                    )}
                                </span>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">Sản phẩm</th>
                                                <th className="text-center">Số lượng</th>
                                                <th className="text-end pe-4">Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.orderItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="fw-bold">{item.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">x{item.quantity}</td>
                                                    <td className="text-end pe-4 fw-bold text-success">{formatPrice(item.price)} ₫</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="2" className="ps-4 fw-bold fs-5">TỔNG CỘNG:</td>
                                                <td className="text-end pe-4 fw-bold text-danger fs-4">{formatPrice(order.amountPaid)} ₫</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetailPage;