import React, { useEffect } from 'react';

const AboutPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <header className="bg-success py-5 shadow-sm">
                <div className="container px-4 px-lg-5 my-5">
                    <div className="text-center text-white">
                        <h1 className="display-4 fw-bolder">Về chúng tôi</h1>
                        <p className="lead fw-normal text-white-50 mb-0">Hành trình xây dựng nền tảng E-commerce NNIT Shop</p>
                    </div>
                </div>
            </header>

            <div className="container mt-5 mb-5" style={{ minHeight: '50vh' }}>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-lg p-4 border-top border-4 border-success rounded-4">
                            
                           
                            <h3 className="fw-bold text-success mb-3">
                                <i className="bi bi-shop me-2"></i>NNIT Shop là gì?
                            </h3>
                            <p className="text-justify text-muted" style={{ lineHeight: '1.8' }}>
                                <strong>NNIT Shop</strong> là một dự án thương mại điện tử (E-commerce) hiện đại. Dự án được xây dựng chủ yếu bằng thư viện giao diện <strong>React</strong> để tạo ra trải nghiệm người dùng mượt mà, kết hợp với môi trường <strong>Node.js</strong> đóng vai trò làm máy chủ (Server) xử lý dữ liệu. NNIT Shop mang lại trải nghiệm mua sắm trực tuyến nhanh chóng, từ việc lựa chọn cấu hình sản phẩm, cập nhật giỏ hàng ngay lập tức mà không cần tải lại trang, cho đến hệ thống quản lý đơn hàng thông minh.
                            </p>

                            <hr className="my-4 text-success opacity-25" />

                            
                            <h3 className="fw-bold text-success mb-3">
                                <i className="bi bi-people-fill me-2"></i>Đội ngũ phát triển
                            </h3>
                            <p className="text-justify text-muted" style={{ lineHeight: '1.8' }}>
                                Dự án này được lên ý tưởng và phát triển bởi nhóm sinh viên ngành Công nghệ Thông tin, Khóa K24 (Lớp IT24C) tại Đại học Đông Á (UDA), bao gồm các thành viên:
                            </p>
                            
                           
                            <div className="card border-0 bg-light rounded-3 mb-4">
                                <ul className="list-group list-group-flush rounded-3">
                                    <li className="list-group-item bg-transparent py-3">
                                        <i className="bi bi-person-badge text-success fs-5 me-3"></i>
                                        <strong className="text-dark">Đặng Ngọc Nhớ</strong> <span className="badge bg-success ms-2">Leader</span>
                                    </li>
                                    <li className="list-group-item bg-transparent py-3">
                                        <i className="bi bi-person-fill text-secondary fs-5 me-3"></i>
                                        <span className="text-dark">Nguyễn Vĩnh Tín</span>
                                    </li>
                                    <li className="list-group-item bg-transparent py-3">
                                        <i className="bi bi-person-fill text-secondary fs-5 me-3"></i>
                                        <span className="text-dark">Nguyễn Văn Dũng Triều</span>
                                    </li>
                                    <li className="list-group-item bg-transparent py-3">
                                        <i className="bi bi-person-fill text-secondary fs-5 me-3"></i>
                                        <span className="text-dark">Trần Tiến Đạt</span>
                                    </li>
                                    <li className="list-group-item bg-transparent py-3">
                                        <i className="bi bi-person-fill text-secondary fs-5 me-3"></i>
                                        <span className="text-dark">Lê Phúc Tấn</span>
                                    </li>
                                </ul>
                            </div>

                            <p className="text-justify text-muted" style={{ lineHeight: '1.8' }}>
                                Với định hướng trở thành những Lập trình viên Web chuyên nghiệp và mong muốn ứng dụng các công nghệ tiên tiến vào thực tiễn, NNIT Shop không chỉ là một đồ án học thuật mà còn là thành quả của sự nỗ lực làm việc nhóm, là bước đệm vững chắc trong quá trình nghiên cứu chuyên sâu của cả team.
                            </p>

                            <div className="alert alert-success mt-4 text-center fw-bold border-0 shadow-sm" role="alert">
                                <i className="bi bi-code-slash me-2"></i> Cảm ơn bạn đã ghé thăm và trải nghiệm hệ thống của nhóm!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutPage;