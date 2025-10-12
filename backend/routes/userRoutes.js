import { Router } from "express";
import { signup, login, editUser, changePassword, getUser, deleteUser } from "../controllers/userController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.put("/edituser", fetchUser, editUser);
router.put("/changepassword", fetchUser, changePassword);
router.get("/getuser", fetchUser, getUser);
router.delete("/deleteuser", fetchUser, deleteUser);

export default router;
