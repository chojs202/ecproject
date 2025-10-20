import { Router } from "express";
import { getCartItems, addCartItem, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", fetchUser, getCartItems);
router.post("/", fetchUser, addCartItem);
router.put("/:productId", fetchUser, updateCartItem);
router.delete("/:productId", fetchUser, removeCartItem);

export default router;
