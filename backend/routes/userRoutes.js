import { Router } from "express";
import {
  signup,
  login,
  editUser,
  changePassword,
  getUser,
  deleteUser,
} from "../controllers/userController.js";
import { fetchUser } from "../middlewares/authMiddleware.js";

const router = Router();

// ==============================
// 👤 USER ROUTES (RESTful)
// ==============================

// ✅ 회원가입
router.post("/signup", signup); // POST /api/users/signup

// ✅ 로그인
router.post("/login", login); // POST /api/users/login

// ✅ 사용자 정보 조회
router.get("/me", fetchUser, getUser); // GET /api/users/me

// ✅ 사용자 정보 수정
router.patch("/me", fetchUser, editUser); // PUT /api/users/me

// ✅ 비밀번호 변경
router.patch("/me/password", fetchUser, changePassword); // PUT /api/users/me/password

// ✅ 회원 탈퇴
router.delete("/me", fetchUser, deleteUser); // DELETE /api/users/me

export default router;
