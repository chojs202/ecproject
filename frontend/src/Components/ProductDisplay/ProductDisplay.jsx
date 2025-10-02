import { useContext, useState, useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from '../Assets/star_icon.png'
import star_dull_icon from '../Assets/star_dull_icon.png'
import { ShopContext } from '../../Context/ShopContext'

export const ProductDisplay = (props) => {
    const { product } = props
    const { addToCart, toggleLike, isProductLiked, isLoggedIn } = useContext(ShopContext)
    const [selectedSize, setSelectedSize] = useState('')
    const [mainImageIndex, setMainImageIndex] = useState(0)

    const images = Array.isArray(product.image) ? product.image : []

    const prevImage = () => {
        setMainImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const nextImage = () => {
        setMainImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    useEffect(() => { setMainImageIndex(0) }, [product])

    // ------------------- 찜 여부 -------------------
    const liked = isProductLiked(product.id)

    return (
        <div className='productdisplay'>
            {/* 좌측: 이미지 + 썸네일 */}
            <div className="productdisplay-left">
                <div className="productdisplay-main-img-container">
                    <button className="prev-btn" onClick={prevImage}>&lt;</button>
                    <img
                        className='productdisplay-main-img'
                        src={images[mainImageIndex] || '/placeholder.png'}
                        alt={product.name}
                    />
                    <button className="next-btn" onClick={nextImage}>&gt;</button>
                </div>

                <div className="productdisplay-thumbnails">
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

            {/* 우측: 상품 정보 */}
            <div className="productdisplay-right">
                <h1>{product.name}</h1>

                <div className="productdisplay-right-stars">
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dull_icon} alt="" />
                    <p>(122)</p>
                </div>

                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">${product.old_price}</div>
                    <div className="productdisplay-right-price-new">${product.new_price}</div>
                </div>

                {product.size && product.size.length > 0 && (
                    <div className="productdisplay-right-sizes">
                        <label htmlFor="size-select">Select Size: </label>
                        <select
                            id="size-select"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                        >
                            <option value="">-- Choose Size --</option>
                            {product.size.map((s, idx) => (
                                <option key={idx} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ----------------- ADD TO CART + LIKE 버튼 ----------------- */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    {/* 찜(하트) 버튼 */}
                    <button
                        className={`like-btn ${liked ? 'liked' : ''}`}
                        onClick={() => {
                            if (!isLoggedIn) {
                              alert("You must be logged in to like a product."); // 로그인 필요 알림
                              return;
                            }
                            console.log("Like button clicked for product:", product.id);
                            toggleLike(product.id);
                        }}
                        title={liked ? 'Remove from Likes' : 'Add to Likes'}
                    >
                        {liked ? '❤️' : '🤍'}
                    </button>
                    
                    {/* ADD TO CART 버튼 */}
                    <button className="add-to-cart-btn"
                        onClick={() => {
                            if (product.size && product.size.length > 0 && !selectedSize) {
                                alert("Please select a size before adding to cart.")
                                return
                            }
                            addToCart({ id: product.id, size: selectedSize })
                        }}
                    >
                        ADD TO CART
                    </button>
                </div>

                <p className='productdisplay-right-category'>
                    <span>Category :</span> {product.category}
                </p>
            </div>
        </div>
    )
}
