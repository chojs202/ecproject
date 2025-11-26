import React, { useContext } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrum } from "../Components/Breadcrums/Breadcrum";
import { ProductDisplay } from "../Components/ProductDisplay/ProductDisplay";
import { DescriptionBox } from "../Components/DescriptionBox/DescriptionBox";
import { RelatedProducts } from "../Components/RelatedProducts/RelatedProducts";

export const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_product?.length
    ? all_product.find((e) => e.id === Number(productId))
    : null;

  if (!product) return <div>Loading product...</div>;

  const productUrl = `${process.env.REACT_APP_BASE_URL}/product/${productId}`;

  return (
    <>
      <Helmet>
        {/* --- 基本 SEO --- */}
        <title>{product.name} | SHOP</title>
        <meta
          name="description"
          content={`Buy ${product.name}. Price: ${product.new_price}. Available sizes: ${product.size?.join(", ")}.`}
        />

        {/* --- Canonical (重複URL防止) --- */}
        <link rel="canonical" href={productUrl} />

        {/* --- OG(Open Graph): 共有プレビュー --- */}
        <meta property="og:title" content={product.name} />
        <meta
          property="og:description"
          content={`High-quality ${product.name} available now.`}
        />
        <meta property="og:image" content={product.image} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />

      </Helmet>

      {/* --- 実際レンダリング要素 --- */}
      <div>
        <Breadcrum product={product} />
        <ProductDisplay product={product} />
        <DescriptionBox product={product} />
        <RelatedProducts product={product} />
      </div>
    </>
  );
};
