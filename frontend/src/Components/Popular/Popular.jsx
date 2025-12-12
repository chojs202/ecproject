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
  const [loading, setLoading] = useState(true);    // ✅ 추가
  const [error, setError] = useState(null);        // ✅ 추가
  const hoverTimer = useRef(null);

  // ✅ women 카테고리 최신 4개 필터링
  useEffect(() => {
    const loadPopular = () => {
      try {
        setLoading(true);
        setError(null);

        if (!Array.isArray(all_product)) {
          throw new Error("Product data is invalid.");
        }

        const womenProducts = all_product.filter(
          (p) => p.category && p.category.toLowerCase() === "women"
        );

        const sorted = [...womenProducts].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // ✅ 상위 4개만
        setPopularProducts(sorted.slice(0, 4));
        // ❌ 여기서 bgImage / isActive 초기값 세팅 안 함 (hover 때만 변경)
      } catch (err) {
        console.error("❌ 인기상품 로딩 중 오류:", err);
        setError("Failed to load popular products. Please try again later.");
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPopular();
  }, [all_product]);

  // ✅ hover 효과 — 배경 전환 (기존 그대로)
  const handleHoverEnter = (image) => {
    const src = Array.isArray(image) ? image[0] : image;
    if (!src || bgImage === src) return;

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

  // ✅ Framer Motion variants (기존 그대로)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.98,
      transition: { duration: 0.55, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "linear" },
    },
    exit: {
      opacity: 0,
      y: 60,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  // ✅ 로딩 상태 – 카드 모양 가짜 UI
  if (loading) {
    return (
      <div className="popular">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
        >
          POPULAR IN WOMEN
        </motion.h1>

        <div className="popular-item">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  // ✅ 에러 상태
  if (error) {
    return (
      <div className="popular">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6 }}
        >
          POPULAR IN WOMEN
        </motion.h1>
        <p style={{ marginTop: "20px", color: "#c00" }}>{error}</p>
      </div>
    );
  }

  // ✅ 인기상품 데이터가 아예 없을 때
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
        <p style={{ marginTop: "20px", color: "#888" }}>
          No popular products found.
        </p>
      </div>
    );
  }

  // ✅ 정상 렌더링 (hover 전에는 배경 X, hover 시에만 변경)
  return (
    <div className="popular">
      <div
        className={`bg-overlay ${isActive ? "active" : ""}`}
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : "none" }}
      ></div>

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
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.25, ease: "easeOut" },
            }}
            onMouseEnter={() => handleHoverEnter(item.image)}
            onMouseLeave={handleHoverLeave}
          >
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
              category={item.category}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
