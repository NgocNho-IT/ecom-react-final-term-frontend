import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/my-orders');
                if (data.success) setOrders(data.orders);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

    if (loading) return <div className="text-center mt-5"><h3>Đang tải lịch sử mua hàng...</h3></div>;

    return (
        <>
            <header className="bg-success py-5">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">Lịch sử mua hàng</h1>
                        <p className="lead fw-normal text-white-50 mb-0">Quản lý các đơn hàng của bạn tại UDA Store</p>
                    </div>
                </div>
            </header>

            <div className="container mt-5 mb-5" style={{ minHeight: '450px' }}>
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="card shadow-sm border-success border-opacity-25">
                            <div className="card-header bg-light fw-bold text-success">DANH SÁCH ĐƠN HÀNG</div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-success">
                                            <tr>
                                                <th className="ps-4">Mã đơn</th>
                                                <th>Ngày đặt</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th className="text-center">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length > 0 ? orders.map(order => (
                                                <tr key={order._id} className="align-middle">
                                                    <td className="ps-4 fw-bold text-dark">#{order._id.substring(18, 24).toUpperCase()}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                                    <td className="fw-bold text-danger">{formatPrice(order.amountPaid)} ₫</td>
                                                    <td>
                                                        {order.status === 'Delivered' ? (
                                                            <span className="badge rounded-pill bg-success">Đã giao hàng</span>
                                                        ) : (
                                                            <span className="badge rounded-pill bg-warning text-dark">Đang xử lý</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <Link to={`/order/${order._id}`} className="btn btn-sm btn-outline-success px-3">
                                                            <i className="bi bi-eye"></i> Xem
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        <i className="bi bi-box-seam d-block fs-1 mb-2"></i>
                                                        Bạn chưa có đơn hàng nào. Hãy mua sắm ngay nhé!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
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

export default OrdersPage;