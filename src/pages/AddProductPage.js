import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const AddProductPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '', category: '', description: '', 
        screen: '', os: '', cpu: '', battery: '', cameraBack: '', cameraFront: '', youtubeId: '',
        price: '', stock: 10, isSale: false, salePrice: ''
    });
    const [image, setImage] = useState(null);

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await API.get('/products/categories');
            if (data.success) setCategories(data.categories);
        };
        fetchCats();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => setImage(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            await API.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' }});
            alert("Đã thêm sản phẩm thành công!");
            navigate('/admin');
        } catch (error) {
            alert("Lỗi thêm sản phẩm: " + (error.response?.data?.message || "Vui lòng thử lại"));
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-9">
                    <div className="card border-0 shadow-lg rounded-4 p-4">
                        <h3 className="fw-bold text-success mb-4 text-center">
                            <i className="bi bi-plus-circle-fill"></i> THÊM SẢN PHẨM MỚI
                        </h3>
                        <hr />
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-8 mb-3">
                                    <label className="form-label fw-bold">Tên sản phẩm</label>
                                    <input type="text" name="name" className="form-control" onChange={handleChange} required />
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label className="form-label fw-bold">Danh mục</label>
                                    <select name="category" className="form-select" onChange={handleChange} required>
                                        <option value="">Chọn danh mục...</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label fw-bold">Hình ảnh sản phẩm</label>
                                    <input type="file" name="image" className="form-control" onChange={handleFileChange} accept="image/*" required />
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label className="form-label fw-bold">Mô tả chi tiết</label>
                                    <textarea name="description" className="form-control" rows="3" onChange={handleChange}></textarea>
                                </div>

                                <h5 className="text-secondary mt-4 mb-2 border-bottom pb-2"><i className="bi bi-cpu"></i> Thông số kỹ thuật</h5>
                                <div className="col-md-6 mb-2 small"><b>Màn hình:</b> <input type="text" name="screen" className="form-control form-control-sm" onChange={handleChange} /></div>
                                <div className="col-md-6 mb-2 small"><b>Hệ điều hành:</b> <input type="text" name="os" className="form-control form-control-sm" onChange={handleChange} /></div>
                                <div className="col-md-6 mb-2 small"><b>CPU:</b> <input type="text" name="cpu" className="form-control form-control-sm" onChange={handleChange} /></div>
                                <div className="col-md-6 mb-2 small"><b>Pin & Sạc:</b> <input type="text" name="battery" className="form-control form-control-sm" onChange={handleChange} /></div>
                                <div className="col-md-6 mb-2 small"><b>Camera sau:</b> <input type="text" name="cameraBack" className="form-control form-control-sm" onChange={handleChange} /></div>
                                <div className="col-md-6 mb-2 small"><b>Camera trước:</b> <input type="text" name="cameraFront" className="form-control form-control-sm" onChange={handleChange} /></div>

                                <h5 className="text-danger mt-4 mb-2 border-bottom pb-2"><i className="bi bi-youtube"></i> Video Review</h5>
                                <div className="col-md-12 mb-3">
                                    <input type="text" name="youtubeId" className="form-control border-danger" placeholder="Dán ID YouTube vào đây..." onChange={handleChange} />
                                </div>

                                <h5 className="text-primary mt-4 mb-2 border-bottom pb-2"><i className="bi bi-currency-dollar"></i> Giá & Kho hàng</h5>
                                <div className="row g-3 p-3 bg-light rounded-3 shadow-sm mx-0">
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Giá bán (VNĐ)</label>
                                        <input type="number" name="price" className="form-control border-primary" onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="small fw-bold">Số lượng kho</label>
                                        <input type="number" name="stock" className="form-control border-primary" value={formData.stock} onChange={handleChange} />
                                    </div>
                                    <div className="col-md-4 mt-3">
                                        <div className="form-check form-switch mt-2">
                                            <input type="checkbox" name="isSale" className="form-check-input" onChange={handleChange} />
                                            <label className="form-check-label fw-bold small">Đang giảm giá?</label>
                                        </div>
                                    </div>
                                    <div className="col-md-8 mt-3">
                                        <input type="number" name="salePrice" className="form-control border-danger" placeholder="Giá khuyến mãi..." onChange={handleChange} disabled={!formData.isSale} />
                                    </div>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mt-5">
                                <button type="submit" className="btn btn-success btn-lg rounded-pill fw-bold shadow"><i className="bi bi-check-lg"></i> XÁC NHẬN LƯU SẢN PHẨM</button>
                                <Link to="/admin" className="btn btn-outline-secondary rounded-pill">Quay lại Dashboard</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;