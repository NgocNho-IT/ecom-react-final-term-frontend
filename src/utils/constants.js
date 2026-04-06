
export const BACKEND_URL = "http://localhost:5000";

/**
 *
 * @param {string} path
 */
export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/300?text=No+Image";
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}/${path}`;
};