import { Router } from "express";
import { applyPromo, getBannerPromo } from "../controllers/promoController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";
const router = Router();

router.post("/applypromo", fetchUser, applyPromo);
router.get("/getbannerpromo", getBannerPromo);

export default router;
