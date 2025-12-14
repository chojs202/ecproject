import React, { useContext, useState } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import { Heart } from "lucide-react";

const Item = ({ id, name, image, new_price, old_price, category }) => {
  const { isLoggedIn, toggleLike, likedProducts } = useContext(ShopContext);
  const [showModal, setShowModal] = useState(false); // 로그인 모달 상태

  // ✅ 찜 상태 확인
  const isLiked = likedProducts?.some(
    (liked) => liked._id === id || liked.id === id
  );

  // ✅ 이미지 처리 (배열 대비)
  const rawSrc =
    Array.isArray(image) && image.length > 0 ? image[0] : "/placeholder.png";
  
  const imageSrc = 
    rawSrc.includes("res.cloudinary.com") && rawSrc.includes("/image/upload/")
    ? rawSrc.replace(
      "/image/upload/",
      "/image/upload/f_auto,q_auto,dpr_auto,w_290,h_347,c_fill,g_auto/"
    ) : rawSrc;
 

  // ✅ 찜 버튼 클릭 핸들러
  const handleLikeClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowModal(true); // 비회원이면 모달 표시
      return;
    }
    toggleLike(id);
  };

  return (
    <>
      <div className="item fade-card">
        {/* ❤️ 찜 버튼 */}
        <button
          className={`like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLikeClick}
          title={isLiked ? "찜 해제" : "찜하기"}
        >
          <Heart size={20} fill={isLiked ? "#ff4d4f" : "none"} />
        </button>

        {/* 🖼️ 상품 이미지 */}
        <Link to={`/${category}/product/${id}`}>
          <img
            src={imageSrc}
            alt={name}
            width={290}
            height={347}
            loading="lazy"
            decoding="async"
            onClick={() => window.scrollTo(0, 0)}
          />
        </Link>

        {/* 📝 하단 정보 (overlay 영역) */}
        <div className="card-info">
          <h3>{name}</h3>
          <div className="price">
            ₩{new_price.toLocaleString()}
            <span className="old-price">₩{old_price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* 🩶 비회원 로그인 모달 */}
      {/* ============================= */}
      {showModal && (
        <div className="like-modal-overlay">
          <div className="like-modal">
            <p>You need to log in to add this item to your wishlist.</p>
            <div className="like-modal-btns">
              <button
                className="modal-login-btn"
                onClick={() => (window.location.href = "/login")}
              >
                Log In
              </button>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Item;
