import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { getImageUrl } from '../utils/constants';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null); 
    const [currentImage, setCurrentImage] = useState(''); 
    
    // MỚI: State quản lý danh sách đánh giá của sản phẩm này
    const [reviews, setReviews] = useState([]);

    const [formData, setFormData] = useState({
        name: '', category: '', description: '', price: '', stock: '', 
        screen: '', os: '', cameraBack: '', cameraFront: '', cpu: '', battery: '',
        youtubeId: '',
        variants: [] 
    });

    const fetchData = async () => {
        try {
            const catRes = await API.get('/products/categories');
            if (catRes.data.success) setCategories(catRes.data.categories);

            const prodRes = await API.get(`/products/${id}`);
            if (prodRes.data.success) {
                const p = prodRes.data.product;
                setCurrentImage(p.image);
                // MỚI: Lấy danh sách đánh giá từ API chi tiết sản phẩm
                setReviews(prodRes.data.reviews || []);
                
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
                    youtubeId: p.youtubeId || '',
                    variants: p.variants || [] 
                });
            }
            setLoading(false);
        } catch (err) {
            console.error("Lỗi fetch:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'youtubeId' && (value.includes('youtube.com') || value.includes('youtu.be'))) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = value.match(regExp);
            if (match && match[2].length === 11) {
                value = match[2]; 
            }
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]); 
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        if (field === 'isSale' && value === false) {
            updatedVariants[index]['salePrice'] = 0;
        }
        setFormData({ ...formData, variants: updatedVariants });
    };

    const handleAddVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, {
                colorName: '', colorHex: '#000000', storageCapacity: '',
                network: '4G', price: 0, isSale: false, salePrice: 0, stock: 0
            }]
        });
    };

    const handleRemoveVariant = (index) => {
        const updatedVariants = formData.variants.filter((_, i) => i !== index);
        setFormData({ ...formData, variants: updatedVariants });
    };

    // MỚI: Logic xóa đánh giá ngay tại trang sửa sản phẩm
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Nhớ có chắc muốn xóa vĩnh viễn đánh giá này không?")) {
            try {
                const { data } = await API.delete(`/admin/review/${reviewId}`);
                if (data.success) {
                    // Cập nhật lại danh sách reviews tại chỗ
                    setReviews(reviews.filter(r => r._id !== reviewId));
                    alert("Đã xóa đánh giá thành công!");
                }
            } catch (error) {
                alert("Lỗi khi xóa đánh giá!");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('youtubeId', formData.youtubeId);
        data.append('screen', formData.screen);
        data.append('os', formData.os);
        data.append('cameraBack', formData.cameraBack);
        data.append('cameraFront', formData.cameraFront);
        data.append('cpu', formData.cpu);
        data.append('battery', formData.battery);
        data.append('variants', JSON.stringify(formData.variants));

        if (imageFile) {
            data.append('image', imageFile); 
        }

        try {
            const response = await API.put(`/admin/product/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                alert("Cập nhật sản phẩm & biến thể thành công!");
                navigate('/admin');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi lưu sản phẩm!");
        }
    };

    if (loading) return <div className="text-center mt-5"><h3>Đang tải dữ liệu...</h3></div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card border-0 shadow-lg rounded-4 p-4">
                        <h3 className="fw-bold text-success mb-4 text-center text-uppercase">
                            <i className="bi bi-pencil-square me-2"></i> Chỉnh sửa toàn diện Sản Phẩm
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            {/* BLOCK 1: THÔNG TIN CƠ BẢN */}
                            <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                                <h5 className="fw-bold text-secondary mb-3">1. Thông tin chung</h5>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label fw-bold small">Tên điện thoại</label>
                                        <input type="text" name="name" className="form-control border-secondary" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold small">Danh mục</label>
                                        <select name="category" className="form-select border-secondary" value={formData.category} onChange={handleChange} required>
                                            <option value="">Chọn...</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-md-12 d-flex align-items-center gap-3 mt-3">
                                        <div>
                                            <label className="form-label fw-bold small d-block">Hình ảnh hiện tại</label>
                                            <img src={getImageUrl(currentImage)} alt="Hiện tại" className="img-thumbnail rounded-3 shadow-sm" style={{ height: '100px', objectFit: 'contain' }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <label className="form-label fw-bold small">Đổi hình ảnh mới</label>
                                            <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label fw-bold small">Mô tả sản phẩm</label>
                                        <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 2: THÔNG SỐ KỸ THUẬT & YOUTUBE */}
                            <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                                <h5 className="fw-bold text-secondary mb-3">2. Thông số kỹ thuật & Media</h5>
                                <div className="row g-3">
                                    <div className="col-md-4"><label className="small fw-bold">Màn hình</label><input type="text" name="screen" className="form-control" value={formData.screen} onChange={handleChange} /></div>
                                    <div className="col-md-4"><label className="small fw-bold">Hệ điều hành</label><input type="text" name="os" className="form-control" value={formData.os} onChange={handleChange} /></div>
                                    <div className="col-md-4"><label className="small fw-bold">CPU</label><input type="text" name="cpu" className="form-control" value={formData.cpu} onChange={handleChange} /></div>
                                    <div className="col-md-4"><label className="small fw-bold">Camera sau</label><input type="text" name="cameraBack" className="form-control" value={formData.cameraBack} onChange={handleChange} /></div>
                                    <div className="col-md-4"><label className="small fw-bold">Camera trước</label><input type="text" name="cameraFront" className="form-control" value={formData.cameraFront} onChange={handleChange} /></div>
                                    <div className="col-md-4"><label className="small fw-bold">Pin</label><input type="text" name="battery" className="form-control" value={formData.battery} onChange={handleChange} /></div>

                                    <div className="col-md-12 mt-3">
                                        <label className="form-label fw-bold text-danger"><i className="bi bi-youtube me-1"></i> ID hoặc Link Youtube</label>
                                        <input type="text" name="youtubeId" className="form-control border-danger" placeholder="Nhập ID hoặc dán cả link Youtube vào đây..." value={formData.youtubeId} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCK 3: QUẢN LÝ BIẾN THỂ (VARIANTS) */}
                            <div className="card border-success p-3 mb-4 rounded-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="fw-bold text-success mb-0">3. Quản lý Phiên bản (Màu sắc, Dung lượng)</h5>
                                    <button type="button" className="btn btn-sm btn-success rounded-pill" onClick={handleAddVariant}>
                                        <i className="bi bi-plus-circle me-1"></i> Thêm phiên bản
                                    </button>
                                </div>
                                
                                {formData.variants.map((variant, index) => (
                                    <div key={index} className="card border-0 shadow-sm mb-3 position-relative bg-white border">
                                        <button type="button" className="btn btn-sm btn-danger position-absolute" style={{ top: '-10px', right: '-10px', borderRadius: '50%' }} onClick={() => handleRemoveVariant(index)}><i className="bi bi-x"></i></button>
                                        <div className="card-body p-3">
                                            <div className="row g-2">
                                                <div className="col-md-3"><label className="small fw-bold">Tên Màu</label><input type="text" className="form-control form-control-sm" value={variant.colorName} onChange={(e) => handleVariantChange(index, 'colorName', e.target.value)} required /></div>
                                                <div className="col-md-2"><label className="small fw-bold">Mã Màu</label><input type="color" className="form-control form-control-sm form-control-color w-100" value={variant.colorHex} onChange={(e) => handleVariantChange(index, 'colorHex', e.target.value)} /></div>
                                                <div className="col-md-4"><label className="small fw-bold">Dung lượng</label><input type="text" className="form-control form-control-sm" value={variant.storageCapacity} onChange={(e) => handleVariantChange(index, 'storageCapacity', e.target.value)} required /></div>
                                                <div className="col-md-3"><label className="small fw-bold">Mạng</label><select className="form-select form-select-sm" value={variant.network} onChange={(e) => handleVariantChange(index, 'network', e.target.value)}><option value="4G">4G</option><option value="5G">5G</option></select></div>
                                                <div className="col-md-3 mt-2"><label className="small fw-bold text-success">Giá gốc</label><input type="number" className="form-control form-control-sm" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} required /></div>
                                                <div className="col-md-3 mt-2"><label className="small fw-bold">Tồn kho</label><input type="number" className="form-control form-control-sm" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} required /></div>
                                                <div className="col-md-2 mt-2 d-flex align-items-end pb-1"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={variant.isSale} onChange={(e) => handleVariantChange(index, 'isSale', e.target.checked)} /><label className="form-check-label small fw-bold text-danger">Sale</label></div></div>
                                                {variant.isSale && <div className="col-md-4 mt-2"><label className="small fw-bold text-danger">Giá Sale</label><input type="number" className="form-control form-control-sm border-danger" value={variant.salePrice} onChange={(e) => handleVariantChange(index, 'salePrice', e.target.value)} required /></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            
                            

                            <div className="d-grid gap-2 mt-5">
                                <button type="submit" className="btn btn-success btn-lg rounded-pill fw-bold shadow">LƯU TOÀN BỘ CẬP NHẬT</button>
                                <Link to="/admin" className="btn btn-outline-secondary rounded-pill mt-2 fw-bold">Trở về Dashboard</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductPage;