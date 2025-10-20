// controllers/cartController.js
import Users from "../models/User.js";

// ✅ 전체 카트 가져오기
export const getCartItems = async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 카트에 아이템 추가
export const addCartItem = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userData = await Users.findById(req.user.id);

    if (!userData.cartData) userData.cartData = {};
    if (!userData.cartData[itemId]) userData.cartData[itemId] = {};
    if (!userData.cartData[itemId][size]) userData.cartData[itemId][size] = 0;

    userData.cartData[itemId][size] += 1;

    await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 카트에서 아이템 제거
export const removeCartItem = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userData = await Users.findById(req.user.id);

    if (userData.cartData[itemId]?.[size] > 0) {
      userData.cartData[itemId][size] -= 1;

      // size 개수가 0이면 삭제
      if (userData.cartData[itemId][size] <= 0) delete userData.cartData[itemId][size];
      // 해당 itemId의 사이즈들이 모두 0이면 itemId도 삭제
      if (Object.keys(userData.cartData[itemId]).length === 0) delete userData.cartData[itemId];

      await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
    }

    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 카트 전체 업데이트
export const updateCartItem = async (req, res) => {
  try {
    const updatedCart = req.body;

    if (!updatedCart || typeof updatedCart !== "object") {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    await Users.findByIdAndUpdate(req.user.id, { cartData: updatedCart });

    res.json({
      success: true,
      cartData: updatedCart,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error("updateCart error:", error);
    res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};
