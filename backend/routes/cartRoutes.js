import { Router } from "express";
import { getCart, addToCart, removeFromCart, updateCart } from "../controllers/cartController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/getcart", fetchUser, getCart);
router.post("/addtocart", fetchUser, addToCart);
router.post("/removefromcart", fetchUser, removeFromCart);
router.post("/updatecart", fetchUser, updateCart);

export default router;
