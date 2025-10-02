import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import banner_1 from "../Assets/banner_1.png";
import banner_2 from "../Assets/banner_2.png";

export const Hero = () => {
  const navigate = useNavigate();

  const slides = [
    { id: 1, image: banner_1, showModal: true },
    { id: 2, image: banner_2, showModal: false }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const slideRef = useRef(null);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  // 드래그/터치 슬라이드
  useEffect(() => {
    const slider = slideRef.current;
    let startX = 0;
    let isDragging = false;

    const onTouchStart = (e) => { startX = e.touches[0].clientX; isDragging = true; }
    const onTouchMove = (e) => {
      if (!isDragging) return;
      const diff = startX - e.touches[0].clientX;
      if (diff > 50) { nextSlide(); isDragging = false; }
      if (diff < -50) { prevSlide(); isDragging = false; }
    }
    const onTouchEnd = () => { isDragging = false; }

    slider.addEventListener("touchstart", onTouchStart);
    slider.addEventListener("touchmove", onTouchMove);
    slider.addEventListener("touchend", onTouchEnd);

    return () => {
      slider.removeEventListener("touchstart", onTouchStart);
      slider.removeEventListener("touchmove", onTouchMove);
      slider.removeEventListener("touchend", onTouchEnd);
    }
  }, [prevSlide, nextSlide]);

  // 배너 클릭 핸들러
  const handleBannerClick = async () => {
    if (currentSlide === 0) {
      setShowPromoModal(true);
    } else if (currentSlide === 1) {
      try {
        // 최신 상품 가져오기
        const res = await fetch("http://localhost:4000/allproducts");
        const data = await res.json();
        if (data.length > 0) {
          const latestProduct = data[data.length - 1]; // 최신 상품
          navigate(`/product/${latestProduct.id}`);
        }
      } catch (err) {
        console.error("Failed to fetch latest product:", err);
      }
    }
  };

  const closeModal = () => setShowPromoModal(false);

  const goToSlide = (idx) => setCurrentSlide(idx);

  return (
    <div
      className="hero"
      ref={slideRef}
      style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
      onClick={() => { if (!showPromoModal) handleBannerClick(); }}
    >
      {/* 좌우 버튼 */}
      <button className="hero-prev" onClick={(e)=>{ e.stopPropagation(); prevSlide(); }}>
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <button className="hero-next" onClick={(e)=>{ e.stopPropagation(); nextSlide(); }}>
        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
      </button>

      {/* 닷(dot) 인디케이터 */}
      <div className="hero-dots">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentSlide ? "active" : ""}`}
            onClick={(e)=>{ e.stopPropagation(); goToSlide(idx); }}
            onMouseEnter={()=> setCurrentSlide(idx)}
          ></span>
        ))}
      </div>

      {/* 모달 */}
      {showPromoModal && (
        <div className="promo-modal" onClick={closeModal}>
          <div className="promo-modal-content" onClick={(e)=>e.stopPropagation()}>
            <h3>You've got a promo code!</h3>
            <p>Copy this code at checkout:</p>
            <strong>SAVE10</strong>
            <button className="promo-close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
