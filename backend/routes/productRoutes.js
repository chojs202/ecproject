import { Router } from "express";
import {
  addProduct, checkProductTitle, getAllProducts, updateProduct, removeProduct, getNewCollections, getPopularInWomen, search,
} from "../controllers/productController.js";

const router = Router();

router.post("/addproduct", addProduct);
router.get("/check-product-title", checkProductTitle);
router.get("/allproducts", getAllProducts);
router.post("/updateproduct", updateProduct);
router.post("/removeproduct", removeProduct);
router.get("/newcollections", getNewCollections);
router.get("/popularinwomen", getPopularInWomen);
router.get("/search", search);

export default router;
