import React, { useEffect, useState } from 'react';
import "./NewCollections.css";
import Item from '../Item/Item';
import { API } from '../../config';
import { motion } from "framer-motion";

export const NewCollections = () => {
  const [new_collection, setNew_collection] = useState([]);

  useEffect(() => {
    fetch(`${API}/newcollections`)
      .then((response) => response.json())
      .then((data) => setNew_collection(data));
  }, []);

  return (
    <div className="new-collections">
      {/* 타이틀 */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}   // ✅ blur 추가
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} // ✅ 선명해지게
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.8 }} 
      >
        NEW COLLECTIONS
      </motion.h1>

      {/* 구분선 */}
      <motion.hr
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.8 }}  
      />

      {/* 상품 목록 */}
      <div className="collections">
        {new_collection.map((item, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              filter: "blur(10px)",    // ✅ 처음 흐림
              x: i < 4 ? -60 : 60,     // 상단4개 왼쪽 / 하단4개 오른쪽
            }}
            whileInView={{
              opacity: 1,
              filter: "blur(0px)",     // ✅ 등장 시 선명해짐
              x: 0,
            }}
            transition={{
              duration: 0.8,
              delay: (i % 4) * 0.1,
              ease: "easeOut",
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
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
