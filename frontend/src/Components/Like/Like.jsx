import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import './Like.css';

const Like = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    likedProducts,
    fetchLikedProducts,
    toggleLike,
    isProductLiked,
    addToCart,
  
  } = useContext(ShopContext);

  const [selectedSizes, setSelectedSizes] = useState({});

  // ------------------- 로그인 체크 -------------------
  useEffect(() => {
    if (!isLoggedIn) {
    navigate("/login", { replace: true });
    return;
    }
    fetchLikedProducts();
  }, [isLoggedIn, fetchLikedProducts, navigate]);

  // ------------------- 사이즈 선택 -------------------
  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  // ------------------- 장바구니 담기 -------------------
  const handleAddToCart = (productId) => {
    const size = selectedSizes[productId];

    // 안전장치: 사이즈 선택 필수
    if (!size) {
      alert("Choice your Size.");
      return;
    }

    // 1개만 장바구니에 추가
    addToCart({ id: productId, size });
    alert("Add cart Success!");
  };

  // ------------------- 화면 렌더 -------------------
  return (
    <div className="like-page">
      <h1>Your Liked Products</h1>

      {likedProducts.length === 0 ? (
        <p>Not like product.</p>
      ) : (
        <div className="like-grid">
          {likedProducts.map((product) => (
            <div key={product.id} className="like-card">
              <img
                src={product.image[0]}
                alt={product.name}
                className="like-card-img"
              />
              <h3>{product.name}</h3>
              <p>Price: ${product.new_price}</p>

              {/* 사이즈 선택 */}
              {product.size && product.size.length > 0 && (
                <select
                  value={selectedSizes[product.id] || ""}
                  onChange={(e) => handleSizeChange(product.id, e.target.value)}
                >
                  <option value="">Select Size</option>
                  {product.size.map((sz) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>
              )}

              {/* 장바구니 담기 + 좋아요 토글 */}
              <div className="action-buttons">
                <button
                  className="add-to-cart-btn"
                  disabled={!selectedSizes[product.id]} // 사이즈 선택 안하면 비활성화
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart
                </button>

                <button
                    className={`like-togglebtn ${isProductLiked(product.id) ? 'liked' : ''}`}
                    onClick={() => {
                    if (isProductLiked(product.id)) {
                      // 찜 해제 확인
                      const confirmRemove = window.confirm("Remove this item from your liked products?");
                      if (!confirmRemove) return;
                    }
                    toggleLike(product.id);
                  }}
                >
                  {isProductLiked(product.id) ? '❤️' : '🤍'}
                </button>
               
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Like;
