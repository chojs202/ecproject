import React, { useState, useEffect } from 'react'
import './RelatedProducts.css'
import Item from '../Item/Item'
import { API } from '../../config'

export const RelatedProducts = ({ product }) => {
  const [relatedProduct, setRelatedProduct] = useState([]);

  useEffect(() => {
    if (!product) return;

    fetch(`${API}/allproducts`)
      .then(res => res.json())
      .then(data => {
        const seenIds = new Set();
        const related = data
          .filter(item => 
            item.category === product.category && 
            item.id !== product.id &&
            !seenIds.has(item.id)
          )
          .map(item => {
            seenIds.add(item.id);
            return item;
          })
          .slice(-4)
          .reverse();

        setRelatedProduct(related);
      })
      .catch(err => console.error(err));
  }, [product]);

  return (
    <div className='relatedproducts'>
        <h1>Related Products</h1>
        <hr />
        <div className="relatedproducts-item">
            {relatedProduct.map((item, i) => (
                <Item 
                  key={i} 
                  id={item.id} 
                  name={item.name} 
                  image={item.image} 
                  new_price={item.new_price} 
                  old_price={item.old_price} 
                />
            ))}
        </div>
    </div>
  )
}