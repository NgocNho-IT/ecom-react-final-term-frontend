import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { getImageUrl } from '../utils/constants'; // Import hàm helper xịn xò

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null); 
    const [currentImage, setCurrentImage] = useState(''); // Lưu link ảnh cũ để hiện lên

    // Khởi tạo đầy đủ các trường phẳng để đồng bộ với Form HTML
    const [formData, setFormData] = useState({
        name: '', 
        category: '', 
        description: '',
        price: '', 
        stock: '', 
        screen: '', 
        os: '', 
        cameraBack: '', 
        cameraFront: '', 
        cpu: '', 
        battery: '',
        youtubeId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy danh mục
                const catRes = await API.get('/products/categories');
                if (catRes.data.success) setCategories(catRes.data.categories);

                // 2. Lấy dữ liệu sản phẩm
                const prodRes = await API.get(`/products/${id}`);
                if (prodRes.data.success) {
                    const p = prodRes.data.product;
                    setCurrentImage(p.image); // Lưu lại đường dẫn ảnh hiện tại
                    setFormData({
                        name: p.name,
                        category: p.category?._id || p.category, 
                        description: p.description,
                        price: p.price || '',
                        stock: p.stock || '',
                        screen: p.specs?.screen || '',
                        os: p.specs?.os || '',
                        cameraBack: p.specs?.cameraBack || '',
                        cameraFront: p.specs?.cameraFront || '',
                        cpu: p.specs?.cpu || '',
                        battery: p.specs?.battery || '',
                        youtubeId: p.youtubeId || ''
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error("Lỗi fetch:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Sử dụng FormData để đóng gói dữ liệu gửi lên Multer
        const data = new FormData();
        
        // Append thủ công từng trường để đảm bảo Backend nhận đủ 100%
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('youtubeId', formData.youtubeId);
        
        // Các trường specs
        data.append('screen', formData.screen);
        data.append('os', formData.os);
        data.append('cameraBack', formData.cameraBack);
        data.append('cameraFront', formData.cameraFront);
        data.append('cpu', formData.cpu);
        data.append('battery', formData.battery);

        // Xử lý ảnh (Nếu Nhớ chọn ảnh mới thì Backend sẽ tự xóa ảnh cũ)
        if (imageFile) {
            data.append('image', imageFile); 
        }

        try {
            const response = await API.put(`/admin/product/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.success) {
                alert("Cập nhật sản phẩm thành công!");
                navigate('/admin');
            }
        } catch (error) {
            console.error("Lỗi submit:", error.response?.data);
            alert(error.response?.data?.message || "Lỗi khi lưu sản phẩm!");
        }
    };

    if (loading) return <div className="text-center mt-5"><h3>Đang tải dữ liệu...</h3></div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-9">
                    <div className="card border-0 shadow-lg rounded-4 p-4">
                        <h3 className="fw-bold text-success mb-4 text-center text-uppercase">
                            <i className="bi bi-pencil-square"></i> Chỉnh sửa sản phẩm
                        </h3>
                        <hr />
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* Nhóm 1: Cơ bản */}
                                <div className="col-md-8">
                                    <label className="form-label fw-bold small text-secondary">Tên điện thoại</label>
                                    <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small text-secondary">Danh mục</label>
                                    <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                                        <option value="">Chọn...</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                {/* Nhóm 2: Giá & Kho */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">Giá bán (VNĐ)</label>
                                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">Số lượng trong kho</label>
                                    <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} />
                                </div>

                                {/* Nhóm 3: Ảnh và Xem trước */}
                                <div className="col-md-12">
                                    <label className="form-label fw-bold small text-secondary d-block">Hình ảnh hiện tại</label>
                                    <img src={getImageUrl(currentImage)} alt="Hiện tại" className="img-thumbnail mb-3" style={{ height: '100px' }} />
                                    
                                    <label className="form-label fw-bold small text-secondary d-block">Thay đổi hình ảnh mới</label>
                                    <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                                    <div className="form-text small">Nếu chọn ảnh mới, hệ thống sẽ tự động dọn dẹp ảnh cũ cho Nhớ.</div>
                                </div>

                                <div className="col-md-12">
                                    <label className="form-label fw-bold small text-secondary">Mô tả</label>
                                    <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange}></textarea>
                                </div>

                                {/* Nhóm 4: Thông số kỹ thuật */}
                                <h5 className="text-secondary mt-4 mb-2 border-bottom pb-2">Thông số kỹ thuật</h5>
                                <div className="col-md-6"><label className="small fw-bold">Màn hình</label><input type="text" name="screen" className="form-control" value={formData.screen} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="small fw-bold">Hệ điều hành</label><input type="text" name="os" className="form-control" value={formData.os} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="small fw-bold">Camera sau</label><input type="text" name="cameraBack" className="form-control" value={formData.cameraBack} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="small fw-bold">Camera trước</label><input type="text" name="cameraFront" className="form-control" value={formData.cameraFront} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="small fw-bold">CPU</label><input type="text" name="cpu" className="form-control" value={formData.cpu} onChange={handleChange} /></div>
                                <div className="col-md-6"><label className="small fw-bold">Pin</label><input type="text" name="battery" className="form-control" value={formData.battery} onChange={handleChange} /></div>

                                {/* Nhóm 5: Video */}
                                <div className="col-md-12 mt-3">
                                    <label className="form-label fw-bold text-danger">Youtube Video ID</label>
                                    <input type="text" name="youtubeId" className="form-control border-danger" value={formData.youtubeId} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="d-grid gap-2 mt-5">
                                <button type="submit" className="btn btn-success btn-lg rounded-pill fw-bold">CẬP NHẬT SẢN PHẨM</button>
                                <Link to="/admin" className="btn btn-light rounded-pill mt-2">Hủy bỏ</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;