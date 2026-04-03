// Sau này đổi cổng 5000 sang link khác chỉ cần sửa duy nhất dòng này!
export const BACKEND_URL = "http://localhost:5000";

/**
 * Hàm lấy link ảnh chuẩn không cần chỉnh
 * @param {string} path - Đường dẫn từ DB (ví dụ: uploads/iphone.jpg)
 */
export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300?text=No+Image";
    
    // Nếu path đã là link web (http...) thì giữ nguyên
    if (path.startsWith('http')) return path;

    // Còn lại tự động nối link Backend
    return `${BACKEND_URL}/${path}`;
};