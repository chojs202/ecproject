import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../Assets/shop_image.webp';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { LogIn, LogOut, Heart, ShoppingCart, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { getTotalCartItems, isLoggedIn, logout, likedProducts } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setScrolled(scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeMenu = (() => {
    switch (location.pathname) {
      case "/": return "shop";
      case "/men": return "men";
      case "/women": return "women";
      case "/kid": return "kid";
      case "/edituser": return "edituser";
      case "/orders": return "orders";
      default: return "";
    }
  })();

  return (
    <>
      {/* ✅ NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-left">
          <Link to="/" onClick={() => {setDropdownOpen(false); window.scrollTo({ top: 0, behavior: "smooth" });}} className="nav-logo">
            <img src={logo} alt="logo" className="logo-img" />
            <span>SHOP</span>
          </Link>

          {/* ✅ 햄버거 메뉴 버튼 */}
          <button
            className="nav-dropdown-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {dropdownOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* ✅ 드롭다운 메뉴 */}
          <ul
            className={`nav-menu ${dropdownOpen ? "nav-menu-visible" : ""}`}
            onClick={() => setDropdownOpen(false)}
          >
            <li className={activeMenu === "shop" ? "active" : ""}><Link to="/">Main</Link></li>
            <li className={activeMenu === "men" ? "active" : ""}><Link to="/men">Men</Link></li>
            <li className={activeMenu === "women" ? "active" : ""}><Link to="/women">Women</Link></li>
            <li className={activeMenu === "kid" ? "active" : ""}><Link to="/kid">Kid</Link></li>
            <li className={activeMenu === "orders" ? "active" : ""}><Link to="/orders">My Orders</Link></li>
            {isLoggedIn && (
              <li className={activeMenu === "edituser" ? "active" : ""}><Link to="/edituser">Edit User</Link></li>
            )}
          </ul>
        </div>

        {/* ✅ 오른쪽 아이콘 */}
        <div className="nav-right">
          {isLoggedIn ? (
            <button
              className="nav-icon-btn"
              data-tooltip="Log out"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut size={20} />
            </button>
          ) : (
            <button
              className="nav-icon-btn"
              data-tooltip="Log in"
              onClick={() => navigate('/login')}
            >
              <LogIn size={20} />
            </button>
          )}

          <Link to="/like" onClick={() => setDropdownOpen(false)} className="nav-icon-wrapper" data-tooltip="Wishlist">
            <Heart size={20} />
            {likedProducts.length > 0 && <span className="icon-badge">{likedProducts.length}</span>}
          </Link>

          <Link to="/cart" onClick={() => setDropdownOpen(false)} className="nav-icon-wrapper" data-tooltip="Cart">
            <ShoppingCart size={20} />
            {getTotalCartItems() > 0 && <span className="icon-badge">{getTotalCartItems()}</span>}
          </Link>
        </div>
      </nav>

      {/* ✅ nav 바깥에 overlay 배치 */}
      {dropdownOpen && (
        <div
          className={`nav-overlay visible`}
          onClick={() => setDropdownOpen(false)}
        ></div>
      )}
    </>
  );
};
