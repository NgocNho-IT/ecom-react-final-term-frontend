import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { getImageUrl } from '../utils/constants';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const fetchNavData = async () => {
        try {
            const catRes = await API.get('/products/categories');
            if (catRes.data.success) setCategories(catRes.data.categories);
            if (user) {
                const cartRes = await API.get('/cart');
                if (cartRes.data.success && cartRes.data.cart) {
                    setCartCount(cartRes.data.cart.items.length);
                }
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Header:", error);
        }
    };

    useEffect(() => {
        fetchNavData();
        const handleCartUpdate = () => {
            console.log("Header đã nhận tín hiệu: Đang cập nhật giỏ hàng...");
            fetchNavData();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user]);
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 0) {
                try {
                    const { data } = await API.get(`/products/search?q=${searchQuery}`);
                    if (data.success) {
                        setSearchResults(data.products);
                        setShowDropdown(true);
                    }
                } catch (error) { console.error("Lỗi tìm kiếm:", error); }
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setCartCount(0);
        navigate('/login');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
            setShowDropdown(false);
        }
    };

    // HÀM MỚI: XÁC ĐỊNH ĐƯỜNG DẪN THEO TÊN HÃNG
    const getBrandRoute = (catName, id) => {
        const name = catName.toLowerCase();
        if (name.includes('iphone') || name.includes('apple')) return `/apple/${id}`;
        if (name.includes('samsung')) return `/samsung/${id}`;
        if (name.includes('xiaomi')) return `/xiaomi/${id}`;
        if (name.includes('vivo')) return `/vivo/${id}`;
        if (name.includes('oppo')) return `/oppo/${id}`;
        return `/category/${id}`;
    };

    return (
        <>
            <style>
                {`
                    .navbar { backdrop-filter: blur(10px); background-color: rgba(255, 255, 255, 0.95) !important; border-bottom: 2px solid #198754; transition: all 0.3s ease; z-index: 1000 !important; }
                    .search-group { border-radius: 50px; overflow: hidden; border: 1px solid #198754; background: #fff; transition: 0.3s; }
                    .search-group:focus-within { box-shadow: 0 0 12px rgba(25, 135, 84, 0.3); transform: translateY(-1px); }
                    .search-input-clean { border: none !important; box-shadow: none !important; padding-left: 15px; }
                    .search-btn-clean { border: none !important; background: #198754; color: white; transition: 0.2s; }
                    .search-btn-clean:hover { background: #145a32; }
                    .nav-link { position: relative; font-weight: 600 !important; color: #333 !important; }
                    .nav-link:hover { color: #198754 !important; }
                    .nav-link::after { content: ''; position: absolute; width: 0; height: 2px; bottom: 0; left: 0; background-color: #198754; transition: 0.3s; }
                    .nav-link:hover::after { width: 100%; }
                    .dropdown-menu { border-radius: 15px !important; border: none !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; margin-top: 10px !important; padding: 10px !important; }
                    .dropdown-item { border-radius: 10px; padding: 8px 15px; transition: 0.2s; }
                    .dropdown-item:hover { background-color: #e8f5e9 !important; color: #198754 !important; }
                    .user-avatar-circle { width: 32px; height: 32px; background: linear-gradient(45deg, #198754, #145a32); color: white; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 0.8rem; font-weight: bold; margin-right: 8px; }
                    .autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; z-index: 2147483647; border-radius: 15px; border: 1px solid #198754; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 8px 0; margin-top: 5px; max-height: 400px; overflow-y: auto; }
                    .autocomplete-item:hover { background-color: #f8f9fa; }
                `}
            </style>

            <nav className="navbar navbar-expand-lg navbar-light sticky-top shadow-sm">
                <div className="container px-4">
                    <Link className="navbar-brand fw-bold text-success fs-3" to="/">NNIT Shop</Link>
                    
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
                        <span className="bi bi-list fs-1 text-success"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                            <li className="nav-item"><Link className="nav-link" to="/">Trang chủ</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/about">Giới thiệu</Link></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="catDrop" role="button" data-bs-toggle="dropdown">Danh mục</a>
                                <ul className="dropdown-menu border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                                    <li><Link className="dropdown-item fw-bold text-success" to="/categories">Tất cả sản phẩm</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {categories.length > 0 ? categories.map((cat) => (
                                        <li key={cat._id}>
                                            <Link className="dropdown-item" to={getBrandRoute(cat.name, cat._id)}>{cat.name}</Link>
                                        </li>
                                    )) : (
                                        <li><span className="dropdown-item text-muted small">Đang tải...</span></li>
                                    )}
                                </ul>
                            </li>
                        </ul>

                        <div className="d-flex mx-auto my-2 my-lg-0 position-relative" ref={searchRef}>
                            <form onSubmit={handleSearchSubmit}>
                                <div className="input-group search-group" style={{ width: '320px' }}>
                                    <input 
                                        className="form-control form-control-sm search-input-clean" 
                                        type="search" 
                                        placeholder="Bạn tìm gì nào..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                                        autoComplete="off"
                                    />
                                    <button className="btn search-btn-clean px-3" type="submit"><i className="bi bi-search"></i></button>
                                </div>
                            </form>

                            {showDropdown && searchResults.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    <ul className="list-unstyled mb-0">
                                        {searchResults.map((item) => (
                                            <li key={item._id} className="autocomplete-item p-2 px-3 border-bottom" style={{ cursor: 'pointer' }} onClick={() => { navigate(`/product/${item._id}`); setShowDropdown(false); }}>
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={getImageUrl(item.image)} 
                                                        className="rounded me-3 border shadow-sm" 
                                                        alt={item.name} 
                                                        style={{ width: '45px', height: '45px', objectFit: 'contain', background: '#fff' }} 
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/45"; }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark small mb-0">{item.name}</div>
                                                        <div className="text-danger fw-bold" style={{ fontSize: '0.85rem' }}>
                                                            {new Intl.NumberFormat('vi-VN').format(item.variants && item.variants[0] ? item.variants[0].price : 0)} ₫
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '0.6rem' }}>NNIT Shop cam kết máy zin</div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <ul className="navbar-nav ms-auto align-items-center">
                            {user ? (
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" data-bs-toggle="dropdown">
                                        <div className="user-avatar-circle shadow-sm">
                                            {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className="text-success fw-bold">{user.firstName}</span>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                        {user.isAdmin && (
                                            <>
                                                <li><Link className="dropdown-item fw-bold text-primary" to="/admin"><i className="bi bi-speedometer2 me-2"></i> Quản trị Shop</Link></li>
                                                <li><hr className="dropdown-divider" /></li>
                                            </>
                                        )}
                                        <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2"></i> Hồ sơ cá nhân</Link></li>
                                        <li><Link className="dropdown-item" to="/update-password"><i className="bi bi-key me-2"></i> Đổi mật khẩu</Link></li>
                                        <li><Link className="dropdown-item" to="/orders"><i className="bi bi-bag-check me-2"></i> Đơn hàng</Link></li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li><button className="dropdown-item text-danger fw-bold bg-transparent border-0 w-100 text-start" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i> Đăng xuất</button></li>
                                    </ul>
                                </li>
                            ) : (
                                <>
                                    <li className="nav-item"><Link className="nav-link" to="/login">Đăng nhập</Link></li>
                                    <li className="nav-item ms-lg-2"><Link className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm" to="/register">Đăng ký</Link></li>
                                </>
                            )}

                            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                                <Link to="/cart" className="btn btn-outline-success border-2 rounded-pill px-3 fw-bold position-relative">
                                    <i className="bi bi-cart-fill"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                                        {cartCount}
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;