import { Router } from "express";
import { createPaymentIntent, createOrder, getOrders } from "../controllers/orderController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();


router.post("/create-payment-intent", createPaymentIntent);
router.post("/create-order", fetchUser, createOrder);
router.get("/orders", fetchUser, getOrders);

export default router;
