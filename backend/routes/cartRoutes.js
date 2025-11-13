import { Router } from "express";
import { getCartItems, addCartItem, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", fetchUser, getCartItems);
router.post("/", fetchUser, addCartItem);
router.put("/", fetchUser, updateCartItem);
router.delete("/", fetchUser, removeCartItem);

export default router;
