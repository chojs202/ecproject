import React, { useEffect, useState, useRef } from "react";
import "./Popular.css";
import Item from "../Item/Item";
import { API } from "../../config";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [bgImage, setBgImage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const hoverTimer = useRef(null);

  useEffect(() => {
    fetch(`${API}/popularinwomen`)
      .then((res) => res.json())
      .then((data) => setPopularProducts(data));
  }, []);

  const handleHoverEnter = (image) => {
    const src = image[0];
    setIsActive(false);
    clearTimeout(hoverTimer.current);
    window._hoverTimer = setTimeout(() => {
      setBgImage(src);
      requestAnimationFrame(() => setIsActive(true));
    }, 30);
  };

  const handleHoverLeave = () => setIsActive(false);

  // ✅ Scroll-Fade 컴포넌트 정의 (등장 + 사라짐)
  const ScrollFadeCard = ({ children, delay = 0 }) => {
    const controls = useAnimation();
    const { ref, inView } = useInView({ threshold: 0.3 });

    useEffect(() => {
      if (inView) {
        // 스크롤 내려올 때
        controls.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.7, delay, ease: "easeOut" },
        });
      } else {
        // 스크롤 위로 올라갈 때
        controls.start({
          opacity: 0,
          y: 60,
          scale: 0.98,
          transition: { duration: 0.5, ease: "easeInOut" },
        });
      }
    }, [inView, controls, delay]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={controls}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="popular">
      <div
        className={`bg-overlay ${isActive ? "active" : ""}`}
        style={{ backgroundImage: `url(${bgImage})` }}
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

      <div className="popular-item">
        {popularProducts.map((item, i) => (
          <ScrollFadeCard key={i} delay={i * 0.12}>
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
              onMouseEnter={() => handleHoverEnter(item.image)}
              onMouseLeave={handleHoverLeave}
            />
          </ScrollFadeCard>
        ))}
      </div>
    </div>
  );
};
