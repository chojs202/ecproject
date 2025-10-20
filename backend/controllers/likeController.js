// controllers/likeController.js
import Product from "../models/Product.js";

// ✅ 상품 좋아요 토글
export const toggleLike = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    // 🔹 그대로 유지 — 커스텀 id 기반 조회
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let liked; // 현재 요청 후 상태 저장

    if (product.likes.includes(userId)) {
      product.likes.pull(userId); // 좋아요 취소
      liked = false;
    } else {
      product.likes.push(userId); // 좋아요 추가
      liked = true;
    }

    await product.save();

    res.json({
      success: true,
      liked, // ✅ 요청 후 상태
      likesCount: product.likes.length,
    });
  } catch (error) {
    console.error("toggleLike error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ 로그인 사용자의 찜 목록 가져오기
export const getMyLikes = async (req, res) => {
  try {
    const userId = req.user.id;
    const likedProducts = await Product.find({ likes: userId });

    res.json({
      success: true,
      products: likedProducts,
    });
  } catch (error) {
    console.error("getMyLikes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ 특정 상품의 좋아요 상태 확인
export const getLikeStatus = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const liked = product.likes.includes(userId);

    res.json({
      success: true,
      liked,
    });
  } catch (error) {
    console.error("getLikeStatus error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
