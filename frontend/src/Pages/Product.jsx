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
  const { category, productId } = useParams();
  const product = all_product?.length
    ? all_product.find((e) => e.id === Number(productId))
    : null;

  if (!product) return <div>Loading product...</div>;

    // ✅ BASE_URL 끝의 '/' 제거해서 // 방지
  const baseUrl = (process.env.REACT_APP_BASE_URL || "").replace(/\/$/, "");

    // ✅ category 검증 (잘못된 canonical/JSON-LD 방지)
  const VALID_CATEGORIES = ["men", "women", "kid"];
  if (!VALID_CATEGORIES.includes(category)) return <div>Not Found</div>;


  const productUrl = `${process.env.REACT_APP_BASE_URL}/${category}/product/${productId}`;
  const imageUrl = Array.isArray(product.image) ? product.image[0] : product.image;

    // =========================
  // ✅ 1) Product JSON-LD
  // =========================
  
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: imageUrl ? [imageUrl] : undefined,
    description: `Buy ${product.name}.`,
    category, // (선택) 카테고리 문자열
    sku: String(product.id), // 있으면 좋음
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "USD",
      price: String(product.new_price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

    // =========================
  // ✅ 2) BreadcrumbList JSON-LD
  // =========================
  const categoryLabelMap = { men: "Men", women: "Women", kid: "Kid" };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryLabelMap[category] || category,
        item: `${baseUrl}/${category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

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
        <meta property="og:type" content="website" />
        
        {/* ✅ JSON-LD: Product */}
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>

        {/* ✅ JSON-LD: Breadcrumb */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      {/* --- 実際レンダリング要素 --- */}
      <div>
        <Breadcrum product={product} category={category} />
        <ProductDisplay product={product} />
        <DescriptionBox product={product} />
        <RelatedProducts product={product} />
      </div>
    </>
  );
};
