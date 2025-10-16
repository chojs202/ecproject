import React, { useEffect, useState, useRef } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import { API } from "../../config";
import { motion } from "framer-motion";

export const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const hoverTimer = useRef(null);

  // ✅ 데이터 불러오기 (안전 처리 포함)
  useEffect(() => {
    fetch(`${API}/popularinwomen`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPopularProducts(Array.isArray(data) ? data : []))
      .catch(() => setPopularProducts([]));
  }, []);

  // ✅ hover 효과 — 깜빡임 방지 + cleanup 포함
  const handleHoverEnter = (image) => {
    const src = image[0];
    if (bgImage === src) return; // 같은 이미지면 skip
    clearTimeout(hoverTimer.current);
    setIsActive(false);
    hoverTimer.current = setTimeout(() => {
      setBgImage(src);
      setIsActive(true);
    }, 60);
  };

  const handleHoverLeave = () => {
    clearTimeout(hoverTimer.current);
    setIsActive(false);
  };

  // ✅ unmount 시 타이머 클린업
  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  // ✅ 애니메이션 설정 (Observer 통합형)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 60,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <div className="popular">
      {/* ✅ 배경 오버레이 */}
      <div
        className={`bg-overlay ${isActive ? "active" : ""}`}
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* ✅ 타이틀 애니메이션 */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.8 }}
      >
        POPULAR IN WOMEN
      </motion.h1>

      <motion.hr
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.8 }}
      />

      {/* ✅ 스크롤 진입 시 순차 등장 */}
      <motion.div
        className="popular-item"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
      >
        {popularProducts.map((item, i) => (
          <motion.div
            key={item.id || i}
            className="fade-card"
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onMouseEnter={() => handleHoverEnter(item.image)}
            onMouseLeave={handleHoverLeave}
            style={{ willChange: "transform, opacity" }}
          >
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
