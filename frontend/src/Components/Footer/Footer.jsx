import React from 'react'
import './Footer.css'
import footer_logo from "../Assets/shop_image.png"
import instagram_icon from "../Assets/instagram_icon.png"
import pinterest_icon from "../Assets/pintester_icon.png"
import whatsapp_icon from "../Assets/whatsapp_icon.png"
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <div className='footer'>
      <Link style={{ textDecoration:'none'}} to="/" >
        <div className="footer-logo" onClick={() => window.scrollTo({ top: 0})}>
          <img src={footer_logo} alt="Logo" />
          <p>SHOP</p>
        </div>
      </Link>

      <ul className="footer-links">
        <li>Company</li>
        <li>Products</li>
        <li>Offices</li>
        <li>About</li>
        <li>Contact</li>
      </ul>

      <div className="footer-social-icon">
        <div className="footer-icons-container">
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
            <img src={instagram_icon} alt="Instagram" />
          </a>
        </div>
        <div className="footer-icons-container">
          <a href="https://www.pinterest.com/" target="_blank" rel="noopener noreferrer">
            <img src={pinterest_icon} alt="Pinterest" />
          </a>
        </div>
        <div className="footer-icons-container">
          <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer">
            <img src={whatsapp_icon} alt="WhatsApp" />
          </a>
        </div>
      </div>

      <div className="footer-copyright">
        <hr />
        <p>Copyright @ 2025 - All Right Reserved</p>
      </div>
    </div>
  )
}
