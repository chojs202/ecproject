import React from 'react'
import { Link } from 'react-router-dom'
import "./Navbar.css"
import navlogo from "../../assets/nav-logo.svg"

const Navbar = () => {
  return (
    <div className="navbar">
        <Link to="/addproduct">
          <img src={navlogo} alt="Logo" className="nav-logo" />
        </Link>
    </div>
  )
}

export default Navbar
