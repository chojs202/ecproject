import React, { useContext, useState, useRef} from 'react';
import './Navbar.css';
import logo from '../Assets/shop_image.png';
import cart_icon from '../Assets/cart_icon.png';
import menu_icon from '../Assets/menu_icon.png';
import search_icon from "../Assets/search_icon.png";
import like_icon from "../Assets/like_icon.png";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';

export const Navbar = () => {
  const { getTotalCartItems, isLoggedIn, logout, likedProducts } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const searchInputRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if(keyword.trim() === "") return;
    navigate(`/search?query=${encodeURIComponent(keyword)}`);
    setKeyword("");
    setShowSearch(false);
    setDropdownOpen(false);
  };

  const handleSearchIconClick = () => {
    setShowSearch(prev => !prev);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 0);
  };

  const getActiveMenu = () => {
    switch(location.pathname){
      case "/": return "shop";
      case "/men": return "men";
      case "/women": return "women";
      case "/kid": return "kid";
      case "/edituser": return "edituser";
      case "/orders": return "orders";
      default: return "";
    }
  };
  const activeMenu = getActiveMenu();


  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" onClick={()=>setDropdownOpen(false)} className="nav-logo">
          <img src={logo} alt="logo" className="logo-img"/>
          <span>SHOP</span>
        </Link>

        <img 
          src={menu_icon} 
          alt="menu" 
          className="nav-dropdown-btn dropdown-img"
          onClick={()=>setDropdownOpen(prev=>!prev)}
        />

        <ul className={`nav-menu ${dropdownOpen ? "nav-menu-visible" : ""}`}>
          <li className={activeMenu==="shop"?"active":""}>
            <Link to="/" onClick={()=>setDropdownOpen(false)}>Shop</Link>
          </li>
          <li className={activeMenu==="men"?"active":""}>
            <Link to="/men" onClick={()=>setDropdownOpen(false)}>Men</Link>
          </li>
          <li className={activeMenu==="women"?"active":""}>
            <Link to="/women" onClick={()=>setDropdownOpen(false)}>Women</Link>
          </li>
          <li className={activeMenu==="kid"?"active":""}>
            <Link to="/kid" onClick={()=>setDropdownOpen(false)}>Kid</Link>
          </li>
          <li className={activeMenu==="orders"?"active":""}>
            <Link to="/orders" onClick={()=>setDropdownOpen(false)}>My Orders</Link>
          </li>
          {isLoggedIn && (
            <li className={activeMenu==="edituser"?"active":""}>
              <Link to="/edituser" onClick={()=>setDropdownOpen(false)}>Edit User</Link>
            </li>
          )}
        </ul>
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <button onClick={()=>{ 
            logout();
            setTimeout(() => navigate('/'), 0); 
           }}>Log Out</button>
        ) : (
          <Link to="/login"><button>Login</button></Link>
        )}

        <div className="nav-search">
          <img 
            src={search_icon} 
            alt="search" 
            className="search-icon search-img"
            onClick={handleSearchIconClick}
          />
          <form onSubmit={handleSearchSubmit}>
            <input 
              ref={searchInputRef}
              type="text" 
              className={`search-input ${showSearch?"active":""}`}
              placeholder="Product Name"
              value={keyword}
              onChange={(e)=>setKeyword(e.target.value)}
              autoFocus
            />
          </form>
        </div>

        <div className="like-wrapper">
          <Link to="/like" onClick={()=>setDropdownOpen(false)}>
            <img src={like_icon} alt="like" className="like-img" />
          </Link>
          {likedProducts.length > 0 && (
            <span className="like-count-badge">{likedProducts.length}</span>
          )}
        </div>

        <Link to="/cart">
          <img src={cart_icon} onClick={()=>setDropdownOpen(false)} alt="cart" className="cart-img"/>
        </Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </nav>
  );
};
