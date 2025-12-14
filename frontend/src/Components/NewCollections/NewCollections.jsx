import React, { useEffect, useState, useContext } from 'react';
import "./NewCollections.css";
import Item from '../Item/Item';
import { motion } from "framer-motion";
import { ShopContext } from '../../Context/ShopContext';

export const NewCollections = () => {
  const { all_product } = useContext(ShopContext);

  const [new_collection, setNew_collection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!Array.isArray(all_product)) {
          throw new Error("The product data is incorrect.");
        }

        // ✅ 날짜순 정렬 (최신순)
        const sorted = [...all_product].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        // ✅ 상위 8개만
        setNew_collection(sorted.slice(0, 8));
      } catch (err) {
        console.error("❌ Product Loding Error:", err);
        setError("There was a problem loading the product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, [all_product]);

  // ✅ 로딩 상태 - NewCollections 전용 스켈레톤
  if (loading) {
    return (
      <div className="new-collections">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        >
          New Collection
        </motion.h1>

        <motion.hr
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        />

        <div className="collections">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="nc-skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  // ✅ 오류 상태
  if (error) {
    return (
      <div className="new-collections">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        >
          New Collection
        </motion.h1>

        <motion.hr
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        />

        <div className="new-collections-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // ✅ 아이템 없음 상태
  if (!new_collection.length) {
    return (
      <div className="new-collections">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        >
          New Collection
        </motion.h1>

        <motion.hr
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
          viewport={{ once: true, amount: 0.8 }}
        />

        <p className="new-collections-empty">
          No new products found.
        </p>
      </div>
    );
  }

  // ✅ 정상 상태 (기존 기능 그대로 유지)
  return (
    <div className="new-collections">
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: "linear" }}
        viewport={{ once: true, amount: 0.8 }}
      >
        New Collection
      </motion.h1>

      <motion.hr
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.2, ease: "linear" }}
        viewport={{ once: true, amount: 0.8 }}
      />

      <div className="collections">
        {new_collection.map((item, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              x: i < 4 ? -30 : 30,
            }}
            whileInView={{
              opacity: 1,
              filter: "blur(0px)",
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: (i % 4) * 0.1,
              ease: "linear",
            }}
            viewport={{ once: false, amount: 0.3 }}
            className="fade-card"
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
      </div>
    </div>
  );
};
