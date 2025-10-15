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
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.8 }} 
      >
        NEW COLLECTIONS
      </motion.h1>

      <motion.hr
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.8 }}  
      />

      <div className="collections">
        {new_collection.map((item, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              x: i < 4 ? -60 : 60, // 상단4개 왼쪽 / 하단4개 오른쪽
            }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: (i % 4) * 0.1, // 순차적으로 등장
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
