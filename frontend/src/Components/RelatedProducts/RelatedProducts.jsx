import React, { useMemo, useContext } from "react";
import "./RelatedProducts.css";
import Item from "../Item/Item";
import { ShopContext } from "../../Context/ShopContext";

export const RelatedProducts = ({ product }) => {
  const { all_product = [] } = useContext(ShopContext);

  const relatedProduct = useMemo(() => {
    if (!product || all_product.length === 0) return [];

    // 같은 카테고리 + 자기 자신 제외
    const pool = all_product.filter(
      (p) => p.category === product.category && p.id !== product.id
    );

    // 1) createdAt이 있으면: 최신순 정렬 → 상위 4개
    const hasCreatedAt = pool.some((p) => !!p.createdAt);
    if (hasCreatedAt) {
      const sorted = [...pool].sort((a, b) => {
        const aKey = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bKey = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bKey - aKey; // 최신순
      });
      return sorted.slice(0, 4);
    }

    // 2) createdAt이 없으면: 기존 데이터가 “오래된→최신” 순이라 가정
    //    뒤에서 4개를 가져와 역순(최신→오래된)으로 노출
    return pool.slice(-4).reverse();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.category, all_product]);

  if (!product) return null;

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {relatedProduct.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
            category={item.category}
          />
        ))}
      </div>
    </div>
  );
};
