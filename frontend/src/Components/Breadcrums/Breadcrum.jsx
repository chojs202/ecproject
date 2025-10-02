import React from 'react';
import './Breadcrum.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';
import { Link } from 'react-router-dom';

export const Breadcrum = ({ product }) => {
  return (
    <div className='breadcrum'>
      <Link to="/" className="breadcrum-link">SHOP</Link>
      <img src={arrow_icon} alt="" />
      <Link to={`/${product.category.toLowerCase()}`} className="breadcrum-link">
        {product.category}
      </Link>
      <img src={arrow_icon} alt="" />
      {product.name}
    </div>
  )
}
