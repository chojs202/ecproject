import Product from "../models/Product.js";

// ✅ 1️⃣ 상품 추가
export const addProduct = async (req, res) => {
  try {
    const newPrice = Number(req.body.new_price);
    const oldPrice = Number(req.body.old_price);

    if (isNaN(newPrice) || isNaN(oldPrice)) {
      return res.status(400).json({ success: false, message: "Price must be a number" });
    }

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

// ✅ 2️⃣ 상품명 중복 확인
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

// ✅ 3️⃣ 전체 상품 조회 (필터링 가능)
export const getAllProducts = async (req, res) => {
  try {
    const { filter, category, sort } = req.query;
    let query = {};

    if (filter === "new") query = { ...query, isNew: true };
    if (category) query = { ...query, category };

    let products = await Product.find(query);

    if (sort === "popular") {
      products = products.sort((a, b) => b.likes.length - a.likes.length);
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error("❌ getAllProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 4️⃣ 상품 수정 (PUT /api/products/:id)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // ✅ param 기반으로 수정
    const { name, old_price, new_price, category, size, description, image } = req.body;

    const updatedProduct = await Product.findOneAndUpdate(
      { id: Number(id) },
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

// ✅ 5️⃣ 상품 삭제 (DELETE /api/products/:id)
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params; // ✅ param으로 변경
    const deletedProduct = await Product.findOneAndDelete({ id: Number(id) });

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("❌ removeProduct error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 6️⃣ 검색 (이름 부분 일치)
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
