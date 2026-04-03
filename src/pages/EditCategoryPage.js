import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const EditCategoryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                // Tận dụng API lấy danh mục để lấy tên cũ
                const { data } = await API.get('/products/categories');
                const currentCat = data.categories.find(c => c._id === id);
                if (currentCat) setName(currentCat.name);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu danh mục");
            }
        };
        fetchCategory();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/admin/category/${id}`, { name });
            alert("Cập nhật danh mục thành công!");
            navigate('/admin');
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi cập nhật!");
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <h4 className="fw-bold text-success mb-4">Sửa danh mục</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-secondary">Tên danh mục</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100 rounded-pill fw-bold">LƯU THAY ĐỔI</button>
                            <Link to="/admin" className="btn btn-link w-100 mt-2 text-secondary text-decoration-none">Quay lại</Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCategoryPage; // Quan trọng: Dòng này sửa lỗi 'module has no exports'