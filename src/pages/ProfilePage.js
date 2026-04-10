import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import API from '../services/api';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    
    const [serverError, setServerError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const formik = useFormik({
        enableReinitialize: true, // RẤT QUAN TRỌNG: Tự động đổ dữ liệu Context vào form khi tải xong
        initialValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phone: user?.phone || ''
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: Yup.object({
            lastName: Yup.string().max(100, 'Họ tối đa 100 ký tự.').required('Họ là bắt buộc.'),
            firstName: Yup.string().max(100, 'Tên tối đa 100 ký tự.').required('Tên là bắt buộc.'),
            phone: Yup.string().matches(/^\d{9,11}$/, 'Số điện thoại không hợp lệ (9-11 số).').required('Số điện thoại là bắt buộc.')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setServerError('');
            setSuccessMsg('');
            try {
                const { data } = await API.put('/users/profile', { 
                    firstName: values.firstName, 
                    lastName: values.lastName, 
                    phone: values.phone 
                });
                if(data) {
                    setSuccessMsg('Tuyệt vời! Đã cập nhật hồ sơ thành công.');
                }
            } catch (err) {
                setServerError('Lỗi khi cập nhật! Vui lòng thử lại.');
            } finally {
                setSubmitting(false);
            }
        }
    });

    const getFieldClass = (fieldName) => {
        if (formik.touched[fieldName] && formik.errors[fieldName]) return 'is-invalid border-danger';
        if (formik.touched[fieldName] && !formik.errors[fieldName]) return 'is-valid border-success';
        return '';
    };

    return (
        <section className="profile-section" style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', padding: '50px 0' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-6">
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                            <div className="text-center text-white" style={{ background: 'linear-gradient(135deg, #198754 0%, #145a32 100%)', borderRadius: '20px 20px 0 0', padding: '40px 20px' }}>
                                <i className="bi bi-person-bounding-box" style={{ fontSize: '4rem' }}></i>
                                <h2 className="fw-bold mb-0 text-uppercase">Hồ sơ của {user?.firstName}</h2>
                                <p className="small opacity-75 mb-0">Quản lý thông tin cá nhân tại NNIT Shop</p>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {serverError && <div className="alert alert-danger py-2 small fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>{serverError}</div>}
                                {successMsg && <div className="alert alert-success py-2 small fw-bold"><i className="bi bi-check-circle-fill me-2"></i>{successMsg}</div>}

                                <form onSubmit={formik.handleSubmit} noValidate>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold small text-secondary">Email đăng nhập (Không thể đổi)</label>
                                        <input type="email" className="form-control text-muted bg-light" style={{ borderRadius: '10px' }} value={user?.email || ''} disabled />
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold small text-secondary">Họ</label>
                                            <input type="text" className={`form-control ${getFieldClass('lastName')}`} style={{ borderRadius: '10px' }} {...formik.getFieldProps('lastName')} />
                                            {formik.touched.lastName && formik.errors.lastName && <div className="invalid-feedback fw-bold">{formik.errors.lastName}</div>}
                                        </div>
                                        <div className="col-md-6 mt-3 mt-md-0">
                                            <label className="form-label fw-bold small text-secondary">Tên</label>
                                            <input type="text" className={`form-control ${getFieldClass('firstName')}`} style={{ borderRadius: '10px' }} {...formik.getFieldProps('firstName')} />
                                            {formik.touched.firstName && formik.errors.firstName && <div className="invalid-feedback fw-bold">{formik.errors.firstName}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label fw-bold small text-secondary">Số điện thoại</label>
                                        <input type="text" className={`form-control ${getFieldClass('phone')}`} style={{ borderRadius: '10px' }} {...formik.getFieldProps('phone')} />
                                        {formik.touched.phone && formik.errors.phone && <div className="invalid-feedback fw-bold">{formik.errors.phone}</div>}
                                    </div>
                                    
                                    <button type="submit" disabled={formik.isSubmitting} className="btn text-white w-100 fw-bold shadow-sm" style={{ background: '#198754', borderRadius: '50px', padding: '12px' }}>
                                        {formik.isSubmitting ? <><span className="spinner-border spinner-border-sm me-2"></span> ĐANG LƯU...</> : <><i className="bi bi-check2-circle me-2"></i> LƯU THAY ĐỔI</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfilePage;