import React, { useEffect, useState, useRef } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import { API } from "../../config";
import { motion } from "framer-motion";

export const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [bgImage, setBgImage] = useState(""); // 현재 표시 중인 배경 이미지
  const [isActive, setIsActive] = useState(false);
  const hoverTimer = useRef(null);

  useEffect(() => {
    fetch(`${API}/popularinwomen`)
      .then((res) => res.json())
      .then((data) => setPopularProducts(data));
  }, []);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 70, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  // ✅ 카드 hover 시 배경 전환
  const handleHoverEnter = (image) => {
    const src = image[0];
    setIsActive(false);
    clearTimeout(hoverTimer.current);
    window._hoverTimer = setTimeout(() => {
      setBgImage(src);
      requestAnimationFrame(() => setIsActive(true));
    }, 30);
  };
  

  // ✅ 카드 벗어나면 배경 사라지기
  const handleHoverLeave = () => {
    setIsActive(false);
  };

  return (
    <div className="popular">
      {/* ✅ 배경 오버레이 */}
      <div
        className={`bg-overlay ${isActive ? "active" : ""}`}
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      <h1>POPULAR IN WOMEN</h1>
      <hr />

      <motion.div
        className="popular-item"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.25 }}
      >
        {popularProducts.map((item, i) => (
          <motion.div
            key={i}
            className="fade-card"
            variants={card}
            onMouseEnter={() => handleHoverEnter(item.image)}
            onMouseLeave={handleHoverLeave}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
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
