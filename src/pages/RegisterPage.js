import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [serverError, setServerError] = useState('');
    // Bổ sung nút Mắt thần cho trang Đăng ký
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            lastName: '', firstName: '', phone: '', email: '', password: '', confirmPassword: ''
        },
        validationSchema: Yup.object({
            lastName: Yup.string().max(100, 'Họ tối đa 100 ký tự.').required('Họ là bắt buộc.'),
            firstName: Yup.string().max(100, 'Tên tối đa 100 ký tự.').required('Tên là bắt buộc.'),
            phone: Yup.string().matches(/^\d{9,11}$/, 'Số điện thoại không hợp lệ (9-11 số).').required('Số điện thoại là bắt buộc.'),
            email: Yup.string().email('Địa chỉ email không hợp lệ.').required('Email là bắt buộc.'),
            password: Yup.string()
                .min(8, 'Mật khẩu phải chứa ít nhất 8 ký tự.')
                .test('not-all-digits', 'Mật khẩu không được chỉ chứa toàn chữ số.', value => !/^\d+$/.test(value))
                .required('Mật khẩu là bắt buộc.'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Nhập lại mật khẩu không khớp.')
                .required('Vui lòng xác nhận mật khẩu.')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setServerError('');
            try {
                const { data } = await API.post('/users/register', { 
                    firstName: values.firstName, lastName: values.lastName, 
                    phone: values.phone, email: values.email, password: values.password 
                });
                if (data.success) { 
                    login(data); 
                    navigate('/'); 
                }
            } catch (err) {
                setServerError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
            } finally {
                setSubmitting(false); // Hoàn thành API thì tắt vòng xoay
            }
        }
    });

    const getFieldClass = (fieldName) => {
        if (formik.touched[fieldName] && formik.errors[fieldName]) return 'is-invalid border-danger';
        if (formik.touched[fieldName] && !formik.errors[fieldName]) return 'is-valid border-success';
        return '';
    };

    return (
        <div className="container py-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="text-center mb-4">
                        <i className="bi bi-person-plus-fill display-4 text-success mb-2"></i>
                        <h2 className="fw-bold text-success">ĐĂNG KÝ TÀI KHOẢN</h2>
                    </div>

                    <div className="card auth-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(25, 135, 84, 0.1)' }}>
                        <div className="card-body p-4 p-md-5">
                            {serverError && (
                                <div className="alert alert-danger py-2 small fw-bold">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {serverError}
                                </div>
                            )}
                            
                            {/* THÊM noValidate Ở ĐÂY ĐỂ TẮT MẶC ĐỊNH HTML5 */}
                            <form onSubmit={formik.handleSubmit} noValidate>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-dark small ms-1">Họ và đệm</label>
                                        <input type="text" placeholder="Nhập họ..."
                                            className={`form-control ${getFieldClass('lastName')}`} 
                                            style={{ borderRadius: '10px' }} 
                                            {...formik.getFieldProps('lastName')}
                                        />
                                        {formik.touched.lastName && formik.errors.lastName && <div className="invalid-feedback fw-bold">{formik.errors.lastName}</div>}
                                    </div>
                                    <div className="col-md-6 mt-3 mt-md-0">
                                        <label className="form-label fw-bold text-dark small ms-1">Tên</label>
                                        <input type="text" placeholder="Nhập tên..."
                                            className={`form-control ${getFieldClass('firstName')}`} 
                                            style={{ borderRadius: '10px' }} 
                                            {...formik.getFieldProps('firstName')}
                                        />
                                        {formik.touched.firstName && formik.errors.firstName && <div className="invalid-feedback fw-bold">{formik.errors.firstName}</div>}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Số điện thoại</label>
                                    <input type="text" placeholder="Nhập số điện thoại..."
                                        className={`form-control ${getFieldClass('phone')}`} 
                                        style={{ borderRadius: '10px' }} 
                                        {...formik.getFieldProps('phone')}
                                    />
                                    {formik.touched.phone && formik.errors.phone && <div className="invalid-feedback fw-bold">{formik.errors.phone}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Địa chỉ Email</label>
                                    <input type="email" placeholder="Ví dụ: nho@gmail.com"
                                        className={`form-control ${getFieldClass('email')}`} 
                                        style={{ borderRadius: '10px' }} 
                                        {...formik.getFieldProps('email')}
                                    />
                                    {formik.touched.email && formik.errors.email ? (
                                        <div className="invalid-feedback fw-bold">{formik.errors.email}</div>
                                    ) : (
                                        <span className="form-text text-muted"><small>Dùng Email này để đăng nhập hệ thống.</small></span>
                                    )}
                                </div>

                                {/* NÂNG CẤP NÚT MẮT THẦN CHO ĐĂNG KÝ */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-dark small ms-1">Mật khẩu</label>
                                    <div className="input-group">
                                        <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu..."
                                            className={`form-control border-end-0 ${getFieldClass('password')}`} 
                                            style={{ borderRadius: '10px 0 0 10px' }} 
                                            {...formik.getFieldProps('password')}
                                        />
                                        <span className={`input-group-text bg-white cursor-pointer ${getFieldClass('password').includes('is-invalid') ? 'border-danger' : getFieldClass('password').includes('is-valid') ? 'border-success' : ''}`}
                                            style={{ borderRadius: '0 10px 10px 0', cursor: 'pointer' }}
                                            onClick={() => setShowPassword(!showPassword)}>
                                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-success`}></i>
                                        </span>
                                        {formik.touched.password && formik.errors.password ? (
                                            <div className="invalid-feedback fw-bold mt-1">{formik.errors.password}</div>
                                        ) : (
                                            <ul className="form-text text-muted small mt-2 mb-0" style={{ paddingLeft: '20px', width: '100%' }}>
                                                <li>Ít nhất 8 ký tự, không được chỉ chứa toàn số.</li>
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-dark small ms-1">Xác nhận mật khẩu</label>
                                    <div className="input-group">
                                        <input type={showConfirmPassword ? "text" : "password"} placeholder="Nhập lại mật khẩu..."
                                            className={`form-control border-end-0 ${getFieldClass('confirmPassword')}`} 
                                            style={{ borderRadius: '10px 0 0 10px' }} 
                                            {...formik.getFieldProps('confirmPassword')}
                                        />
                                        <span className={`input-group-text bg-white cursor-pointer ${getFieldClass('confirmPassword').includes('is-invalid') ? 'border-danger' : getFieldClass('confirmPassword').includes('is-valid') ? 'border-success' : ''}`}
                                            style={{ borderRadius: '0 10px 10px 0', cursor: 'pointer' }}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-success`}></i>
                                        </span>
                                        {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="invalid-feedback fw-bold mt-1">{formik.errors.confirmPassword}</div>}
                                    </div>
                                </div>

                                {/* NÚT BẤM CÓ HIỆU ỨNG LOADING CHỐNG SPAM CLICK */}
                                <div className="d-grid gap-2">
                                    <button type="submit" disabled={formik.isSubmitting} className="btn text-white shadow-sm" style={{ background: 'linear-gradient(45deg, #198754, #145a32)', border: 'none', padding: '12px', borderRadius: '50px', fontWeight: 'bold' }}>
                                        {formik.isSubmitting ? (
                                            <><span className="spinner-border spinner-border-sm me-2"></span> ĐANG XỬ LÝ...</>
                                        ) : (
                                            <>ĐĂNG KÝ NGAY <i className="bi bi-arrow-right-short"></i></>
                                        )}
                                    </button>
                                </div>
                            </form>
                            <hr className="my-4 text-muted" />
                            <div className="text-center">
                                <p className="small mb-0">Bạn đã có tài khoản rồi?</p>
                                <Link to="/login" style={{ color: '#198754', fontWeight: 'bold', textDecoration: 'none' }}>Đăng nhập tại đây</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;