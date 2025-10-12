import Product from "../models/Product.js"; // ✅ .js 확장자 포함

// ==============================
// 1️⃣ 상품 추가
// ==============================
export const addProduct = async (req, res) => {
  try {
    const newPrice = Number(req.body.new_price);
    const oldPrice = Number(req.body.old_price);

    if (isNaN(newPrice) || isNaN(oldPrice)) {
      return res.status(400).json({ success: false, message: "Price must be a number" });
    }

    // 마지막 id 찾기
    const lastProduct = await Product.findOne({}).sort({ id: -1 });
    const id = lastProduct ? lastProduct.id + 1 : 1;

    if (!req.body.name) return res.status(400).json({ success: false, message: "Product name is required" });
    if (!req.body.category) return res.status(400).json({ success: false, message: "Category is required" });

    const images = Array.isArray(req.body.image) ? req.body.image : [];
    if (images.length === 0)
      return res.status(400).json({ success: false, message: "At least one image is required" });

    const product = new Product({
      id,
      name: req.body.name,
      image: images,
      size: Array.isArray(req.body.size) ? req.body.size : [],
      category: req.body.category,
      new_price: newPrice,
      old_price: oldPrice,
      description: req.body.description || "",
    });

    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("❌ addProduct error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// ==============================
// 2️⃣ 상품명 중복 확인
// ==============================
export const checkProductTitle = async (req, res) => {
  try {
    const name = req.query.name?.trim();
    if (!name) return res.json({ exists: false });

    const exists = await Product.exists({ name });
    res.json({ exists: !!exists });
  } catch (error) {
    console.error("❌ checkProductTitle error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 3️⃣ 전체 상품 조회
// ==============================
export const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    console.error("❌ getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 4️⃣ 상품 수정
// ==============================
export const updateProduct = async (req, res) => {
  try {
    const { id, name, old_price, new_price, category, size, description, image } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      {
        name,
        old_price: Number(old_price),
        new_price: Number(new_price),
        category,
        size: size || [],
        description,
        image: image || [],
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("❌ updateProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 5️⃣ 상품 삭제
// ==============================
export const removeProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("❌ removeProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 6️⃣ 신규 컬렉션 조회 (최근 8개)
// ==============================
export const getNewCollections = async (_req, res) => {
  try {
    const newcollection = await Product.find({}).sort({ date: -1 }).limit(8);
    res.send(newcollection);
  } catch (error) {
    console.error("❌ getNewCollections error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 7️⃣ 여성 인기상품 조회
// ==============================
export const getPopularInWomen = async (_req, res) => {
  try {
    const popular = await Product.find({ category: "women" }).sort({ date: -1 }).limit(4);
    res.send(popular);
  } catch (error) {
    console.error("❌ getPopularInWomen error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 8️⃣ 상품 검색 (이름 부분 일치)
// ==============================
export const search = async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query) return res.json({ success: true, products: [] });

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error("❌ search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
