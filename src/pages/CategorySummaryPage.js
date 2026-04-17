import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const CategorySummaryPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await API.get('/products/categories');
                if (data.success) setCategories(data.categories);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi lấy danh mục:", error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Nhận diện hãng để gán logo và màu sắc tương ứng
    const getBrandData = (catName, id) => {
        const name = catName.toLowerCase();
        if (name.includes('iphone') || name.includes('apple')) {
            return { route: `/apple/${id}`, logo: <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="logo-img" alt="Apple" />, color: 'dark' };
        }
        if (name.includes('samsung')) {
            return { route: `/samsung/${id}`, logo: <img src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Samsung_Galaxy_logo.svg" className="logo-img" alt="Samsung" />, color: 'primary' };
        }
        if (name.includes('xiaomi')) {
            return { route: `/xiaomi/${id}`, logo: <img src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg" className="logo-img" alt="Xiaomi" />, color: 'warning' };
        }
        if (name.includes('vivo')) {
            return { route: `/vivo/${id}`, logo: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Vivo_logo_2019.svg/3840px-Vivo_logo_2019.svg.png" className="logo-img" alt="Vivo" />, color: 'info' };
        }
        if (name.includes('oppo')) {
            return { route: `/oppo/${id}`, logo: <img src="https://cdn.hoanghamobile.vn//Uploads/2026/03/26/logo-oppo-15.png" className="logo-img" alt="Oppo" />, color: 'success' };
        }
        return { route: `/category/${id}`, logo: <i className="bi bi-grid-fill text-secondary" style={{ fontSize: '3.5rem' }}></i>, color: 'secondary' };
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
                <h4 className="text-success fw-bold">Đang tải thương hiệu...</h4>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    body { background-color: #f8f9fa; }
                    
                    /* HEADER GRADIENT SANG TRỌNG */
                    .brand-header {
                        background: linear-gradient(135deg, #1e2022 0%, #000000 100%);
                        position: relative;
                        overflow: hidden;
                    }
                    .brand-header::after {
                        content: '';
                        position: absolute;
                        top: -50%; left: -50%; width: 200%; height: 200%;
                        background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
                        z-index: 1;
                    }
                    .brand-header .container { position: relative; z-index: 2; }

                    /* HIỆU ỨNG THẺ 3D CAO CẤP */
                    .cat-card { 
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                        border-radius: 24px !important; 
                        border: 2px solid #ffffff;
                        background: #ffffff;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    }
                    .cat-card:hover { 
                        transform: translateY(-12px) scale(1.02); 
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important; 
                        border-color: #f0f0f0;
                    }

                    /* HIỆU ỨNG LOGO NỔI BẬT */
                    .logo-img { 
                        width: 85px; 
                        height: 85px; 
                        object-fit: contain; 
                        margin-bottom: 20px; 
                        transition: transform 0.5s ease, filter 0.5s ease; 
                        filter: grayscale(20%);
                    }
                    .cat-card:hover .logo-img { 
                        transform: scale(1.15); 
                        filter: grayscale(0%);
                    }

                    /* HIỆU ỨNG NÚT KHÁM PHÁ */
                    .explore-badge {
                        transition: all 0.3s ease;
                        font-size: 0.85rem;
                        font-weight: 700;
                        padding: 8px 20px !important;
                    }
                    .cat-card:hover .explore-badge {
                        transform: translateY(3px);
                    }
                    .explore-icon {
                        display: inline-block;
                        transition: transform 0.3s ease;
                    }
                    .cat-card:hover .explore-icon {
                        transform: translateX(5px);
                    }
                `}
            </style>

            <header className="brand-header py-5 shadow-sm">
                <div className="container px-4 px-lg-5 my-5 text-center text-white">
                    <h1 className="display-4 fw-bolder mb-3 tracking-wide">THƯƠNG HIỆU ĐIỆN THOẠI</h1>
                    <p className="lead fw-normal text-white-50 mb-0" style={{ letterSpacing: '1px' }}>
                        Lựa chọn đẳng cấp từ các nhà sản xuất công nghệ hàng đầu thế giới
                    </p>
                </div>
            </header>

            <div className="container mt-5 mb-5" style={{ minHeight: '450px' }}>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-4 justify-content-center">
                    {categories.map((category) => {
                        const brand = getBrandData(category.name, category._id);
                        return (
                            <div className="col" key={category._id}>
                                <Link to={brand.route} className="text-decoration-none">
                                    <div className="card h-100 text-center py-5 cat-card position-relative overflow-hidden">
                                        <div className="card-body d-flex flex-column align-items-center justify-content-center z-1">
                                            
                                            {/* Phần Logo */}
                                            <div className="mb-2">
                                                {brand.logo}
                                            </div>
                                            
                                            {/* Tên Thương hiệu */}
                                            <h4 className={`card-title mt-3 fw-bolder text-uppercase text-${brand.color}`} style={{ letterSpacing: '0.5px' }}>
                                                {category.name}
                                            </h4>
                                            
                                            {/* Nút Khám phá */}
                                            <div className={`badge explore-badge bg-${brand.color} bg-opacity-10 text-${brand.color} rounded-pill mt-3`}>
                                                Khám phá ngay <i className="bi bi-arrow-right explore-icon ms-1"></i>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default CategorySummaryPage;