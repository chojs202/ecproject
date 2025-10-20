import { Router } from "express";
import {
  addProduct,
  checkProductTitle,
  getAllProducts,
  updateProduct,
  removeProduct,
  search,
} from "../controllers/productController.js";

const router = Router();

// ==============================
// 🛒 PRODUCTS ROUTES (RESTful)
// ==============================

// ✅ 상품 등록 (Create)
// POST /api/products
router.post("/", addProduct);

// ✅ 전체 상품 조회 (Read)
// GET /api/products
router.get("/", getAllProducts);

// ✅ 상품명 중복 확인
// GET /api/products/check-title?name=상품명
router.get("/check-title", checkProductTitle);

// ✅ 상품 검색 (부분 일치)
// GET /api/products/search?q=검색어
router.get("/search", search);

// ✅ 상품 수정 (Update)
// PATCH /api/products/:id
router.patch("/:id", updateProduct);

// ✅ 상품 삭제 (Delete)
// DELETE /api/products/:id
router.delete("/:id", removeProduct);

export default router;
