import Promo from "../models/Promo.js"; 

// ==============================
// 1️⃣ 프로모 코드 적용 API
// ==============================
export const applyPromo = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    // 활성화된 코드 검색
    const promo = await Promo.findOne({ code: code.toUpperCase(), active: true });
    if (!promo) {
      return res.status(400).json({ success: false, message: "Invalid promo code" });
    }

    // 최소 장바구니 금액 확인
    if (cartTotal < promo.minCartValue) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Minimum cart value for this promo code is $${promo.minCartValue}`,
        });
    }

    // 할인 계산
    let discountAmount = 0;
    if (promo.discountType === "percent") discountAmount = cartTotal * (promo.amount / 100);
    else discountAmount = promo.amount;

    // 결과 반환
    res.json({
      success: true,
      discountPercent: promo.amount,
      newTotal: cartTotal - discountAmount,
    });
  } catch (error) {
    console.error("❌ applyPromo Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==============================
// 2️⃣ 기본 프로모 코드 생성 (서버 시작 시 실행)
// ==============================
export const createDefaultPromo = async () => {
  try {
    const existing = await Promo.findOne({ code: "SAVE10" });
    if (!existing) {
      await Promo.create({
        code: "SAVE10",
        discountType: "percent",
        amount: 10,
        minCartValue: 0,
        active: true,
      });
      console.log("✅ Default promo code SAVE10 created.");
    } else {
      console.log("ℹ️ Default promo code already exists.");
    }
  } catch (error) {
    console.error("❌ Error creating default promo code:", error);
  }
};

// ==============================
// 3️⃣ 배너 클릭 시 쿠폰 발급 API
// ==============================
export const getBannerPromo = async (_req, res) => {
  try {
    const code = "SAVE10"; // 고정 쿠폰 코드
    const promo = await Promo.findOne({ code, active: true });

    if (!promo) {
      return res.status(404).json({ success: false, message: "Promo not found" });
    }

    res.json({
      success: true,
      code: promo.code,
      discountType: promo.discountType,
      amount: promo.amount,
      minCartValue: promo.minCartValue,
    });
  } catch (error) {
    console.error("❌ getBannerPromo Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
