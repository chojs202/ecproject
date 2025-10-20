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
router.post("/", addProduct); 
// → POST /api/products

// ✅ 상품 전체 조회 (Read, with optional filters)
// 예: GET /api/products?filter=new&category=women&sort=popular
router.get("/", getAllProducts);

// ✅ 특정 상품 수정 (Update)
// 예: PUT /api/products/12
router.put("/:id", updateProduct);

// ✅ 특정 상품 삭제 (Delete)
// 예: DELETE /api/products/12
router.delete("/:id", removeProduct);

// ✅ 상품명 중복 확인
// 예: GET /api/products/check-title?name=티셔츠
router.get("/check-title", checkProductTitle);

// ✅ 상품 검색 (부분 일치)
// 예: GET /api/products/search?q=셔츠
router.get("/search", search);

export default router;
