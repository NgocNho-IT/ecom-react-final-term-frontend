import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: Yup.object({
            email: Yup.string().email('Địa chỉ email không hợp lệ.').required('Vui lòng nhập email đăng nhập.'),
            password: Yup.string().required('Vui lòng nhập mật khẩu.')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setServerError('');
            try {
                const { data } = await API.post('/users/login', { email: values.email, password: values.password });
                if (data.success) { 
                    login(data); 
                    navigate('/'); 
                }
            } catch (err) {
                setServerError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác!');
            } finally {
                setSubmitting(false); 
            }
        }
    });

    // HÀM MỚI: Chỉ đổi màu cho cái Khung Wrapper bên ngoài, tránh lỗi của Bootstrap
    const getWrapperClass = (fieldName) => {
        if (formik.touched[fieldName] && formik.errors[fieldName]) return 'border-danger';
        if (formik.touched[fieldName] && !formik.errors[fieldName]) return 'border-success';
        return 'border-secondary-subtle'; // Màu viền mặc định
    };

    return (
        <section className="login-section" style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-5">
                        <div className="card login-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 35px rgba(25, 135, 84, 0.1)', overflow: 'hidden' }}>
                            <div className="login-header text-center" style={{ background: 'linear-gradient(135deg, #198754 0%, #145a32 100%)', padding: '40px 20px', color: 'white' }}>
                                <i className="bi bi-person-circle display-4 mb-3 d-inline-block"></i>
                                <h3 className="fw-bold mb-0">ĐĂNG NHẬP</h3>
                                <p className="small mb-0 opacity-75">Chào mừng bạn trở lại với NNIT Shop</p>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {serverError && (
                                    <div className="alert alert-danger py-2 small fw-bold">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i> {serverError}
                                    </div>
                                )}
                                
                                <form onSubmit={formik.handleSubmit} noValidate>
                                    
                                    {/* Ô NHẬP EMAIL ĐƯỢC THIẾT KẾ LẠI BẰNG WRAPPER (CHỐNG LỖI UI) */}
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">Email đăng nhập</label>
                                        <div className={`d-flex align-items-center border bg-white ${getWrapperClass('email')}`} 
                                             style={{ borderRadius: '12px', padding: '4px 8px', transition: 'all 0.3s' }}>
                                            
                                            <input 
                                                type="email" 
                                                placeholder="Ví dụ: nho@gmail.com" 
                                                className="form-control form-control-lg border-0 shadow-none bg-transparent" 
                                                style={{ fontSize: '1rem' }}
                                                {...formik.getFieldProps('email')}
                                            />
                                            
                                            {/* Chèn Icon Trạng thái Thủ công (Đẹp và không đứt gãy) */}
                                            {formik.touched.email && !formik.errors.email && <i className="bi bi-check-circle-fill text-success px-2 fs-5"></i>}
                                            {formik.touched.email && formik.errors.email && <i className="bi bi-exclamation-circle-fill text-danger px-2 fs-5"></i>}
                                        </div>
                                        {/* Hiển thị dòng chữ báo lỗi */}
                                        {formik.touched.email && formik.errors.email && (
                                            <div className="text-danger fw-bold small mt-1 ms-1">{formik.errors.email}</div>
                                        )}
                                    </div>

                                    {/* Ô NHẬP MẬT KHẨU (GỘP CẢ DẤU TICK VÀ MẮT THẦN VÀO MỘT KHỐI) */}
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">Mật khẩu</label>
                                        <div className={`d-flex align-items-center border bg-white ${getWrapperClass('password')}`} 
                                             style={{ borderRadius: '12px', padding: '4px 8px', transition: 'all 0.3s' }}>
                                            
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                placeholder="Nhập mật khẩu..." 
                                                className="form-control form-control-lg border-0 shadow-none bg-transparent" 
                                                style={{ fontSize: '1rem' }}
                                                {...formik.getFieldProps('password')}
                                            />

                                            {/* Icon Trạng Thái */}
                                            {formik.touched.password && !formik.errors.password && <i className="bi bi-check-circle-fill text-success px-1 fs-5"></i>}
                                            {formik.touched.password && formik.errors.password && <i className="bi bi-exclamation-circle-fill text-danger px-1 fs-5"></i>}
                                            
                                            {/* Nút Mắt thần Ngăn cách */}
                                            <div className="border-start ms-1 ps-2 my-1">
                                                <i 
                                                    className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} ${formik.touched.password && formik.errors.password ? 'text-danger' : 'text-success'} px-2 fs-5`} 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                ></i>
                                            </div>
                                        </div>
                                        {/* Hiển thị dòng chữ báo lỗi */}
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-danger fw-bold small mt-1 ms-1">{formik.errors.password}</div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-2 mt-4">
                                        <button type="submit" disabled={formik.isSubmitting} className="btn text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #198754, #145a32)', padding: '12px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {formik.isSubmitting ? (
                                                <><span className="spinner-border spinner-border-sm me-2"></span> Đang đăng nhập...</>
                                            ) : (
                                                'Đăng nhập ngay'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="small text-muted mb-1">Chưa có tài khoản?</p>
                                    <Link to="/register" className="small" style={{ color: '#198754', fontWeight: 'bold' }}>Tạo tài khoản mới tại đây</Link>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center mt-4">
                            <Link to="/" className="text-secondary text-decoration-none small">
                                <i className="bi bi-arrow-left"></i> Quay lại trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;