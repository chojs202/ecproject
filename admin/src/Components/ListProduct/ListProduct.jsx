import React, { useEffect, useState } from "react";
import cross_icon from "../../assets/cross_icon.png";
import "./ListProduct.css";
import EditProductModal from "../EditProductModal/EditProductModal";
import { API } from "../../config";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ 전체 상품 불러오기 (GET /api/products)
  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
    
      // ✅ data.products로 지정
      if (data.success && Array.isArray(data.products)) {
        setAllProducts(data.products);
      } else {
        console.error("Unexpected response format:", data);
        setAllProducts([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      setAllProducts([]);
    }
  };
  useEffect(() => {
    fetchInfo();
  }, []);

  // ✅ 상품 삭제 (DELETE /api/products/:id)
  const remove_product = async (id) => {
    if (!window.confirm("Do you really want to delete this product?")) return;

    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("🗑️ Product deleted successfully!");
        setAllProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("❌ Delete failed:", error);
      alert("Error deleting product");
    }
  };

  // ✅ 수정 후 리스트 즉시 반영
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
