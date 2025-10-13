// controllers/orderController.js
import Stripe from "stripe";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ 결제 Intent 생성
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe는 센트 단위
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 주문 생성
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, discount, discountPercent, finalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items to order" });
    }

    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
      discount: discount || 0,
      discountPercent: discountPercent || 0,
      finalAmount: finalAmount || totalAmount,
    });

    await order.save();

    res.json({ success: true, orderId: order._id });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ 주문 목록 조회
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
