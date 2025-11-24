import { useContext, useState, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import { motion } from 'framer-motion'     // ✅ 추가
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'
import { Heart } from 'lucide-react' 

export const ProductDisplay = ({ product }) => {
  const { addToCart, toggleLike, isProductLiked, isLoggedIn } = useContext(ShopContext)
  const [selectedSize, setSelectedSize] = useState('')
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLikeModal, setShowLikeModal] = useState(false)

  const images = Array.isArray(product.image) ? product.image : []
  const liked = isProductLiked(product.id)

  const nextImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setMainImageIndex(prev => prev + 1)
  }

  const prevImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setMainImageIndex(prev => prev - 1)
  }

  const handleTransitionEnd = () => {
    if (mainImageIndex === -1) {
      setIsTransitioning(false)
      setMainImageIndex(images.length - 1)
    } else if (mainImageIndex === images.length) {
      setIsTransitioning(false)
      setMainImageIndex(0)
    } else {
      setIsTransitioning(false)
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 20,
    flickThreshold: 0.3,
  })

  useEffect(() => { setMainImageIndex(0) }, [product])

  return (
    <div className="productdetail">
      <div className="productdetail-container">
        <div className="productdetail-gallery">
          {/* ================= 이미지 슬라이드 ================= */}
          <div className="main-image-box">
            <div
              className="main-image-slide-wrapper"
              {...handlers}
              style={{
                transform: `translateX(-${(mainImageIndex + 1) * 100}%)`,
                transition: isTransitioning ? 'transform 0.45s ease' : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {images.length > 0 && (
                <img
                  src={images[images.length - 1]}
                  alt="clone-last"
                  className="slide-image"
                  draggable={false}
                />
              )}
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx}`}
                  className="slide-image"
                  draggable={false}
                />
              ))}
              {images.length > 0 && (
                <img src={images[0]} alt="clone-first" className="slide-image" draggable={false} />
              )}
            </div>

            {/* ❤️ 좋아요 버튼 */}
            <button
              className={`like-product-btn ${liked ? 'liked' : ''}`}
              onClick={() => {
                if (!isLoggedIn) {
                  setShowLikeModal(true)    // ✅ 비로그인 시 모달 표시
                  return
                }
                toggleLike(product.id)
              }}
              title={liked ? '찜 해제' : '찜하기'}
            >
              <Heart size={20} fill={liked ? '#ff4d4f' : 'none'} />
            </button>

            <button className="prev-btn" onClick={prevImage} disabled={isTransitioning}>
              &lt;
            </button>
            <button className="next-btn" onClick={nextImage} disabled={isTransitioning}>
              &gt;
            </button>
          </div>

          {/* 썸네일 */}
          <div className="thumbnail-row">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx}`}
                className={`thumbnail ${idx === mainImageIndex ? 'active' : ''}`}
                onMouseEnter={() => setMainImageIndex(idx)}
              />
            ))}
          </div>
        </div>

        {/* ================= 상품 정보 (부드럽게 등장) ================= */}
        <motion.div
          className="productdetail-info"
          initial={{ opacity: 0, y: 0, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 10,   // 튕김 정도
            damping: 5,     // 감속 정도
            duration: 1.1,
          }}
        >
          <h1 className="product-title">{product.name}</h1>

          <div className="rating">
            {[...Array(4)].map((_, i) => (
              <img key={i} src={star_icon} alt="star" />
            ))}
            <img src={star_dull_icon} alt="dull star" />
            <p>(122)</p>
          </div>

          <div className="price-box">
            <span className="old-price">${product.old_price}</span>
            <span className="new-price">${product.new_price}</span>
          </div>

          {product.size?.length > 0 && (
            <div className="size-select">
              <label htmlFor="size-select">Size:</label>
              <select
                id="size-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">-- Choose Size --</option>
                {product.size.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="add-to-cart-btn"
            onClick={() => {
              if (product.size && product.size.length > 0 && !selectedSize) {
                alert('Please select a size before adding to cart.')
                return
              }
              addToCart({ id: product.id, size: selectedSize })
            }}
          >
            ADD TO CART
          </button>

          <p className="category-text">
            <span>Category :</span> {product.category}
          </p>
        </motion.div>
      </div>
       {showLikeModal && (
          <div className="product-like-modal-overlay">
            <div className="product-like-modal">
              <p>You need to log in to add this item to your wishlist.</p>
              <div className="product-like-modal-btns">
                <button
                  className="product-modal-login-btn"
                  onClick={() => (window.location.href = '/login')}
                >
                  Log In
                </button>
                <button
                  className="product-modal-close-btn"
                  onClick={() => setShowLikeModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
