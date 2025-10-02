import React, { useEffect, useState } from "react";
import cross_icon from "../../assets/cross_icon.png";
import "./ListProduct.css";
import EditProductModal from "../EditProductModal/EditProductModal";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchInfo = async () => {
    const res = await fetch("http://localhost:4000/allproducts");
    const data = await res.json();
    setAllProducts(data);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAllProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = (updatedProduct) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      <div className="listproduct-allproducts">
        <div className="listproduct-format-main listproduct-header">
          <p>Products</p>
          <p>Title</p>
          <p>Size</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Edit</p>
          <p>Remove</p>
        </div>

        {allproducts.map((product, idx) => (
          <div key={idx} className="listproduct-format">
            <div className="listproduct-product-icon">
              {product.image?.[0] && <img src={product.image[0]} alt={product.name} />}
            </div>
            <p>{product.name}</p>
            <div className="listproduct-size-tags">
              {product.size?.length ? (
                <>
                  {product.size.slice(0, 3).map((s, i) => (
                    <span key={i} className="listproduct-size-tag">{s}</span>
                  ))}
                  {product.size.length > 3 && (
                    <span className="listproduct-size-tag more" title={product.size.join(", ")}>
                      +{product.size.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="listproduct-size-tag empty">-</span>
              )}
            </div>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <button
              className="listproduct-edit-btn"
              onClick={() =>
                setSelectedProduct(
                  selectedProduct && selectedProduct.id === product.id
                    ? null
                    : product
                )
              }
            >
              Edit
            </button>
            <img
              onClick={() => remove_product(product.id)}
              className="listproduct-remove-icon"
              src={cross_icon}
              alt="remove"
            />
          </div>
        ))}
      </div>

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ListProduct;
