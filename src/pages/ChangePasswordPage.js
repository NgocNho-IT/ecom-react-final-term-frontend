import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    
    const [serverError, setServerError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const formik = useFormik({
        initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: Yup.object({
            oldPassword: Yup.string().required('Vui lòng nhập mật khẩu hiện tại.'),
            newPassword: Yup.string()
                .min(8, 'Mật khẩu mới phải chứa ít nhất 8 ký tự.')
                .test('not-all-digits', 'Mật khẩu mới không được chỉ chứa toàn chữ số.', value => !/^\d+$/.test(value))
                .required('Vui lòng nhập mật khẩu mới.'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Xác nhận mật khẩu không khớp!')
                .required('Vui lòng xác nhận mật khẩu mới.')
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setServerError('');
            setSuccessMsg('');
            try {
                const { data } = await API.put('/users/update-password', { 
                    oldPassword: values.oldPassword, 
                    newPassword: values.newPassword 
                });
                if (data.success) {
                    setSuccessMsg('Đổi mật khẩu thành công! Đang quay lại hồ sơ...');
                    resetForm();
                    setTimeout(() => navigate('/profile'), 2000);
                }
            } catch (err) {
                setServerError(err.response?.data?.message || "Lỗi khi đổi mật khẩu!");
            } finally {
                setSubmitting(false);
            }
        }
    });

    // ĐÃ SỬA: Thêm tham số enableSuccess, nếu là false thì không bao giờ hiện viền Xanh
    const getWrapperClass = (fieldName, enableSuccess = true) => {
        if (formik.touched[fieldName] && formik.errors[fieldName]) return 'border-danger';
        if (formik.touched[fieldName] && !formik.errors[fieldName] && enableSuccess) return 'border-success';
        return 'border-secondary-subtle';
    };

    return (
        <>
            <style>
                {`
                    .password-section {
                        background-color: #f8f9fa;
                        min-height: 85vh;
                        display: flex;
                        align-items: center;
                        padding: 50px 0;
                    }
                    .password-card {
                        border: none;
                        border-radius: 20px;
                        box-shadow: 0 15px 35px rgba(25, 135, 84, 0.1) !important;
                    }
                    .password-header {
                        background: linear-gradient(135deg, #198754 0%, #145a32 100%);
                        color: white;
                        border-radius: 20px 20px 0 0;
                        padding: 35px 20px;
                    }
                    .password-card label {
                        font-weight: 600;
                        font-size: 0.85rem;
                        color: #495057;
                        margin-bottom: 8px;
                        display: block;
                    }
                    .password-card .helptext {
                        display: block;
                        font-size: 0.75rem;
                        color: #6c757d;
                        margin-top: 5px;
                        line-height: 1.4;
                        background: #f1f8f4;
                        padding: 10px;
                        border-radius: 8px;
                        border-left: 3px solid #198754;
                    }
                    .btn-save-pw {
                        background-color: #198754;
                        border: none;
                        padding: 14px;
                        border-radius: 50px;
                        font-weight: bold;
                        letter-spacing: 0.5px;
                        transition: 0.3s;
                    }
                    .btn-save-pw:hover {
                        background-color: #145a32;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(25, 135, 84, 0.3);
                    }
                `}
            </style>

            <section className="password-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">
                            <div className="card password-card">
                                <div className="password-header text-center">
                                    <div className="mb-3">
                                        <i className="bi bi-shield-lock-fill" style={{ fontSize: '3.5rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold mb-0 text-uppercase">Đổi Mật Khẩu</h3>
                                    <p className="small opacity-75 mb-0 mt-2">Đảm bảo an toàn cho tài khoản NNIT</p>
                                </div>

                                <div className="card-body p-4 p-md-5 bg-white rounded-bottom-4">
                                    {serverError && <div className="alert alert-danger py-2 small fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>{serverError}</div>}
                                    {successMsg && <div className="alert alert-success py-2 small fw-bold"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}

                                    <form onSubmit={formik.handleSubmit} noValidate>
                                        
                                        {/* MẬT KHẨU HIỆN TẠI - ĐÃ TẮT HIỆU ỨNG THÀNH CÔNG */}
                                        <div className="mb-4">
                                            <label>Mật khẩu hiện tại</label>
                                            {/* Truyền false vào hàm getWrapperClass để cấm hiện viền xanh */}
                                            <div className={`d-flex align-items-center border bg-white ${getWrapperClass('oldPassword', false)}`} style={{ borderRadius: '12px', padding: '4px 8px', transition: 'all 0.3s' }}>
                                                <input type={showOld ? "text" : "password"} className="form-control border-0 shadow-none bg-transparent" {...formik.getFieldProps('oldPassword')} />
                                                
                                                {/* Đã xóa đoạn code render dấu tick xanh ở đây */}
                                                
                                                {formik.touched.oldPassword && formik.errors.oldPassword && <i className="bi bi-exclamation-circle-fill text-danger px-1"></i>}
                                                <div className="border-start ms-1 ps-2 my-1">
                                                    <i className={`bi ${showOld ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary px-2`} style={{ cursor: 'pointer' }} onClick={() => setShowOld(!showOld)}></i>
                                                </div>
                                            </div>
                                            {formik.touched.oldPassword && formik.errors.oldPassword && <div className="text-danger fw-bold small mt-1 ms-1">{formik.errors.oldPassword}</div>}
                                        </div>

                                        {/* MẬT KHẨU MỚI - GIỮ NGUYÊN HIỆU ỨNG TỐT */}
                                        <div className="mb-4">
                                            <label>Mật khẩu mới</label>
                                            <div className={`d-flex align-items-center border bg-white ${getWrapperClass('newPassword')}`} style={{ borderRadius: '12px', padding: '4px 8px', transition: 'all 0.3s' }}>
                                                <input type={showNew ? "text" : "password"} className="form-control border-0 shadow-none bg-transparent" {...formik.getFieldProps('newPassword')} />
                                                {formik.touched.newPassword && !formik.errors.newPassword && <i className="bi bi-check-circle-fill text-success px-1"></i>}
                                                {formik.touched.newPassword && formik.errors.newPassword && <i className="bi bi-exclamation-circle-fill text-danger px-1"></i>}
                                                <div className="border-start ms-1 ps-2 my-1">
                                                    <i className={`bi ${showNew ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary px-2`} style={{ cursor: 'pointer' }} onClick={() => setShowNew(!showNew)}></i>
                                                </div>
                                            </div>
                                            {formik.touched.newPassword && formik.errors.newPassword ? (
                                                <div className="text-danger fw-bold small mt-1 ms-1">{formik.errors.newPassword}</div>
                                            ) : (
                                                <span className="helptext">
                                                    <ul className="mb-0 ps-3">
                                                        <li>Mật khẩu phải chứa ít nhất 8 ký tự.</li>
                                                        <li>Không được chỉ chứa toàn chữ số.</li>
                                                    </ul>
                                                </span>
                                            )}
                                        </div>

                                        {/* XÁC NHẬN MẬT KHẨU MỚI - GIỮ NGUYÊN HIỆU ỨNG TỐT */}
                                        <div className="mb-4">
                                            <label>Xác nhận mật khẩu mới</label>
                                            <div className={`d-flex align-items-center border bg-white ${getWrapperClass('confirmPassword')}`} style={{ borderRadius: '12px', padding: '4px 8px', transition: 'all 0.3s' }}>
                                                <input type={showConfirm ? "text" : "password"} className="form-control border-0 shadow-none bg-transparent" {...formik.getFieldProps('confirmPassword')} />
                                                {formik.touched.confirmPassword && !formik.errors.confirmPassword && <i className="bi bi-check-circle-fill text-success px-1"></i>}
                                                {formik.touched.confirmPassword && formik.errors.confirmPassword && <i className="bi bi-exclamation-circle-fill text-danger px-1"></i>}
                                                <div className="border-start ms-1 ps-2 my-1">
                                                    <i className={`bi ${showConfirm ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary px-2`} style={{ cursor: 'pointer' }} onClick={() => setShowConfirm(!showConfirm)}></i>
                                                </div>
                                            </div>
                                            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                                                <div className="text-danger fw-bold small mt-1 ms-1">{formik.errors.confirmPassword}</div>
                                            ) : (
                                                <span className="helptext text-muted small" style={{ background: 'transparent', border: 'none', padding: '0', marginTop: '5px' }}>Vui lòng nhập lại mật khẩu y hệt như trên.</span>
                                            )}
                                        </div>

                                        <div className="d-grid gap-2 mt-4">
                                            <button type="submit" disabled={formik.isSubmitting} className="btn btn-save-pw text-white shadow-sm">
                                                {formik.isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span> ĐANG XỬ LÝ...</> : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
                                            </button>
                                            <Link to="/profile" className="btn btn-light rounded-pill fw-bold mt-2">
                                                Hủy bỏ
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ChangePasswordPage;