import React, { useEffect, useState, useRef, useContext } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import { motion } from "framer-motion";
import { ShopContext } from "../../Context/ShopContext";

export const Popular = () => {
  const { all_product } = useContext(ShopContext); // ✅ 전체 상품 불러오기

  const [popularProducts, setPopularProducts] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const hoverTimer = useRef(null);

  // ✅ women 카테고리 최신 4개 필터링
  useEffect(() => {
    if (!Array.isArray(all_product)) return;

    try {
      // 1️⃣ women 카테고리만 필터
      const womenProducts = all_product.filter(
        (p) => p.category && p.category.toLowerCase() === "women"
      );

      // 2️⃣ 날짜순 정렬 (최신순)
      const sorted = [...womenProducts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      // 3️⃣ 상위 4개만
      setPopularProducts(sorted.slice(0, 4));
    } catch (err) {
      console.error("❌ 인기상품 로딩 중 오류:", err);
      setPopularProducts([]);
    }
  }, [all_product]);

  // ✅ hover 효과 — 배경 전환
  const handleHoverEnter = (image) => {
    const src = Array.isArray(image) ? image[0] : image;
    if (bgImage === src) return;
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

  useEffect(() => {
    return () => clearTimeout(hoverTimer.current);
  }, []);

  // ✅ Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1, ease: "easeOut" },
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
    exit: { opacity: 0, y: 60, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  // ✅ 로딩 상태 처리
  if (!popularProducts.length) {
    return (
      <div className="popular">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
        >
          POPULAR IN WOMEN
        </motion.h1>
        <p style={{ marginTop: "20px", color: "#888" }}>Waiting Products...</p>
      </div>
    );
  }

  return (
    <div className="popular">
      {/* ✅ 배경 오버레이 */}
      <div
        className={`bg-overlay ${isActive ? "active" : ""}`}
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* ✅ 타이틀 */}
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

      {/* ✅ 순차 등장 애니메이션 */}
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
