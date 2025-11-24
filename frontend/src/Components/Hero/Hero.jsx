import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import banner_1 from "../Assets/banner_1.png";
import banner_2 from "../Assets/banner_2.png";
import { API } from "../../config";
import { Check } from "lucide-react";

export const Hero = () => {
  const navigate = useNavigate();
  const slides = [
    { id: 1, image: banner_1, showModal: true },
    { id: 2, image: banner_2, showModal: false },
  ];

  const [copied, setCopied] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const slideRef = useRef(null);
  const intervalRef = useRef(null); // 🔹 자동전환 interval 저장용 ref
  const isHoveredRef = useRef(false); // 🔹 hover 상태 추적

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // -------------------------------
  // 🧭 자동 슬라이드 (hover 시 일시정지 포함)
  // -------------------------------
  useEffect(() => {
    const startAutoSlide = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!isHoveredRef.current) {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }
      }, 5000); // 5초마다 전환
    };

    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

  // -------------------------------
  // 🖱️ 마우스 올림 / 벗어남 감지
  // -------------------------------
  useEffect(() => {
    const slider = slideRef.current;
    if (!slider) return;

    const handleMouseEnter = () => { isHoveredRef.current = true; };
    const handleMouseLeave = () => { isHoveredRef.current = false; };

    slider.addEventListener("mouseenter", handleMouseEnter);
    slider.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      slider.removeEventListener("mouseenter", handleMouseEnter);
      slider.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // -------------------------------
  // 📱 드래그/터치 슬라이드
  // -------------------------------
  useEffect(() => {
    const slider = slideRef.current;
    let startX = 0;
    let isDragging = false;

    const onTouchStart = (e) => { startX = e.touches[0].clientX; isDragging = true; };
    const onTouchMove = (e) => {
      if (!isDragging) return;
      const diff = startX - e.touches[0].clientX;
      if (diff > 50) { nextSlide(); isDragging = false; }
      if (diff < -50) { prevSlide(); isDragging = false; }
    };
    const onTouchEnd = () => { isDragging = false; };

    slider.addEventListener("touchstart", onTouchStart);
    slider.addEventListener("touchmove", onTouchMove);
    slider.addEventListener("touchend", onTouchEnd);

    return () => {
      slider.removeEventListener("touchstart", onTouchStart);
      slider.removeEventListener("touchmove", onTouchMove);
      slider.removeEventListener("touchend", onTouchEnd);
    };
  }, [prevSlide, nextSlide]);

  // -------------------------------
  // 🛍️ 배너 클릭
  // -------------------------------
  const handleBannerClick = async () => {
    if (currentSlide === 0) {
      setShowPromoModal(true);
    } else if (currentSlide === 1) {
      try {
        const res = await fetch(`${API}/api/products/latest`);
        if (!res.ok) throw new Error("Failed to fetch latest product");

        const data = await res.json();
        if (data.success && data.product && data.product.id) {
          navigate(`/product/${data.product.id}`);
        }
      } catch (err) {
        console.error("Failed to fetch latest product:", err);
      }
    }
  };

  const closeModal = () => setShowPromoModal(false);
  const goToSlide = (idx) => setCurrentSlide(idx);

  return (
    <div className="hero-container" ref={slideRef}>
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`hero-slide ${idx === currentSlide ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-text">
            {idx === 0 ? (
              <>
                <h1>Welcome Offer - 10% OFF</h1>
                <p>Enjoy your first shopping experience with a special discount.</p>
                <button onClick={() => !showPromoModal && handleBannerClick()}>
                  Get Coupon
                </button>
              </>
            ) : (
              <>
                <h1>New Collection</h1>
                <p>Discover the latest addition to our collection.</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                >
                  Shop Now
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* 좌우 버튼 */}
      <button className="hero-prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
        <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
      </button>
      <button className="hero-next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
      </button>

      {/* 닷 인디케이터 */}
      <div className="hero-dots">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentSlide ? "active" : ""}`}
            onClick={(e) => { e.stopPropagation(); goToSlide(idx); }}
          ></span>
        ))}
      </div>

      {/* 프로모션 모달 */}
      {showPromoModal && (
        <div className="promo-modal" onClick={closeModal}>
          <div className="promo-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>You've got a promo code!</h3>
            <p>Use this code at checkout:</p>
            <div className="promo-code-wrapper">
              <strong
                className="promo-code"
                onClick={() => {
                  navigator.clipboard.writeText("SAVE10");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
              >
                SAVE10
              </strong>
              {copied && (
                <div className="copied-check">
                  <Check size={20} strokeWidth={3} />
                </div>
              )}
            </div>
            <button className="promo-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
