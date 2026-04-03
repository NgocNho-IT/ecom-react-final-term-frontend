import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const AddCategoryPage = () => {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Đảm bảo có API POST /admin/categories ở Backend
            await API.post('/admin/categories', { name });
            alert("Đã thêm danh mục mới!");
            navigate('/admin');
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi thêm danh mục!");
        }
    };

    return (
        <div className="container mt-5 mb-5" style={{ minHeight: '60vh' }}>
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h4 className="fw-bold text-success mb-4">Thêm danh mục</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-secondary">Tên danh mục</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Tên danh mục mới..." 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100 rounded-pill fw-bold py-2">
                                LƯU DANH MỤC
                            </button>
                            <Link to="/admin" className="btn btn-link w-100 mt-2 text-secondary text-decoration-none fw-bold">
                                Quay lại
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryPage;