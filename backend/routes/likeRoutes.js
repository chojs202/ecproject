import { Router } from "express";
import { toggleLike, getMyLikes, getLikeStatus } from "../controllers/likeController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/products/:id/like", fetchUser, toggleLike);
router.get("/likes", fetchUser, getMyLikes);
router.get("/products/:id/like-status", fetchUser, getLikeStatus);

export default router;
