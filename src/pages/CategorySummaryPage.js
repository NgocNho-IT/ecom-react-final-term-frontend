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

    const getCategoryLogo = (catName) => {
        const name = catName.toLowerCase();
        if (name === 'iphone') return <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="logo-img" alt="Apple" />;
        if (name === 'samsung') return <img src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Samsung_Galaxy_logo.svg" className="logo-img" alt="Samsung" />;
        if (name === 'xiaomi') return <img src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg" className="logo-img" alt="Xiaomi" />;

        
        return <i className="bi bi-phone text-success" style={{ fontSize: '3.5rem' }}></i>;
    };

    if (loading) return <div className="text-center mt-5"><h3>Đang tải danh mục...</h3></div>;

    return (
        <>
            <style>
                {`
                    .cat-card { transition: 0.3s; border-radius: 20px !important; }
                    .cat-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(25, 135, 84, 0.2) !important; border-color: #198754 !important; }
                    .logo-img { width: 80px; height: 80px; object-fit: contain; margin-bottom: 15px; transition: 0.3s; }
                    .cat-card:hover .logo-img { transform: scale(1.1); }
                `}
            </style>

            <header className="bg-success py-5 shadow-sm">
                <div className="container px-4 px-lg-5 my-5 text-center text-white">
                    <h1 className="display-4 fw-bolder">THƯƠNG HIỆU ĐIỆN THOẠI</h1>
                    <p className="lead fw-normal text-white-50 mb-0">Lựa chọn dòng sản phẩm từ các hãng công nghệ hàng đầu</p>
                </div>
            </header>

            <div className="container mt-5 mb-5" style={{ minHeight: '450px' }}>
                <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
                    {categories.map((category) => (
                        <div className="col" key={category._id}>
                            <Link to={`/category/${category._id}`} className="text-decoration-none">
                                <div className="card h-100 text-center border-success border-opacity-25 shadow-sm py-5 cat-card">
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        {getCategoryLogo(category.name)}
                                        <h3 className="card-title text-dark mt-3 fw-bolder text-uppercase">{category.name}</h3>
                                        <div className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 mt-2">
                                            Khám phá ngay <i className="bi bi-arrow-right-short"></i>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CategorySummaryPage;