import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Footer = () => {
    const [categories, setCategories] = useState([]);

    // Lấy danh mục từ Database để hiển thị link chuẩn
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/products/categories');
                if (data.success) {
                    // Chỉ lấy tối đa 5 danh mục để tránh tràn Footer
                    setCategories(data.categories.slice(0, 5));
                }
            } catch (error) {
                console.error("Lỗi lấy danh mục ở Footer:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-success text-white pt-5 pb-4 mt-5 shadow-lg">
            <div className="container text-center text-md-start">
                <div className="row">
                    {/* CỘT 1: GIỚI THIỆU */}
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold text-white">NNIT SHOP</h5>
                        <p className="small text-light" style={{ lineHeight: '1.8' }}>
                            Hệ thống bán lẻ điện thoại di động chính hãng hàng đầu. 
                            Chúng tôi cam kết máy zin 100%, bảo hành uy tín và giá cả cạnh tranh nhất thị trường.
                        </p>
                        <div className="mt-4">
                            <a href="https://facebook.com" className="text-white me-3 transition-icon"><i className="bi bi-facebook fs-5"></i></a>
                            <a href="https://youtube.com" className="text-white me-3 transition-icon"><i className="bi bi-youtube fs-5"></i></a>
                            <a href="https://tiktok.com" className="text-white me-3 transition-icon"><i className="bi bi-tiktok fs-5"></i></a>
                            <a href="https://github.com" className="text-white me-3 transition-icon"><i className="bi bi-github fs-5"></i></a>
                        </div>
                    </div>

                    {/* CỘT 2: SẢN PHẨM (DYNAMIC TỪ DB) */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 fw-bold text-white">Danh Mục</h6>
                        {categories.length > 0 ? categories.map((cat) => (
                            <p key={cat._id}>
                                <Link to={`/category/${cat._id}`} className="text-light text-decoration-none small hover-link">
                                    {cat.name}
                                </Link>
                            </p>
                        )) : (
                            <p className="small text-light-50">Đang tải...</p>
                        )}
                        <p><Link to="/categories" className="text-warning text-decoration-none small fw-bold">Tất cả sản phẩm</Link></p>
                    </div>

                    {/* CỘT 3: HỖ TRỢ */}
                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 fw-bold text-white">Chính Sách</h6>
                        <p><Link to="/baohanh" className="text-light text-decoration-none small hover-link">Chính sách bảo hành</Link></p>
                        <p><Link to="/vanchuyen" className="text-light text-decoration-none small hover-link">Vận chuyển & Giao nhận</Link></p>
                        <p><Link to="/doitra" className="text-light text-decoration-none small hover-link">Đổi trả sản phẩm</Link></p>
                        <p><Link to="/thanhtoan" className="text-light text-decoration-none small hover-link">Hình thức thanh toán</Link></p>
                    </div>

                    {/* CỘT 4: LIÊN HỆ (INFO NHỚ) */}
                    <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h6 className="text-uppercase mb-4 fw-bold text-white">Liên Hệ</h6>
                        <p className="small text-light"><i className="bi bi-person-fill me-2"></i> Đặng Ngọc Nhớ</p>
                        <p className="small text-light"><i className="bi bi-house-door-fill me-2"></i> Lớp IT24C - ĐH Đông Á, Đà Nẵng</p>
                        <p className="small text-light"><i className="bi bi-envelope-fill me-2"></i> nho.it24c@uda.edu.vn</p>
                        <p className="small text-light"><i className="bi bi-telephone-fill me-2"></i> +84 123 456 789</p>
                    </div>
                </div>

                <hr className="mb-4 mt-4 border-light opacity-25" />

                {/* DÒNG BẢN QUYỀN */}
                <div className="row align-items-center">
                    <div className="col-md-7 col-lg-8 text-md-start">
                        <p className="text-light small mb-0">Copyright © 2026 All rights reserved by:
                            <a href="#" className="text-warning text-decoration-none fw-bold ms-1">NNIT Shop - Đặng Ngọc Nhớ</a>
                        </p>
                    </div>
                    <div className="col-md-5 col-lg-4 text-center text-md-end mt-3 mt-md-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" width="40" className="me-3 filter-white" alt="Paypal" />
                        <img src="https://icolor.vn/wp-content/uploads/2024/08/logo-visa.png" width="40" className="me-3 bg-white rounded p-1" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" width="40" className="bg-white rounded p-1" alt="MasterCard" />
                    </div>
                </div>
            </div>

            {/* CSS INLINE ĐỂ FOOTER XỊN HƠN */}
            <style>
                {`
                    .hover-link:hover { color: #ffc107 !important; padding-left: 5px; transition: 0.3s; }
                    .transition-icon:hover { transform: scale(1.2); color: #ffc107 !important; display: inline-block; transition: 0.3s; }
                    .filter-white { filter: brightness(0) invert(1); }
                `}
            </style>
        </footer>
    );
};

export default Footer;