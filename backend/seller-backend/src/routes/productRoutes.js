import { Router } from "express";
import { auth, isSeller } from "../../../../shared/middlewares/auth.js";
import { addProductToCategory } from "../../../admin-backend/src/controllers/Category.js";
import { createProduct, deleteProduct, editProducts, getSellerProducts } from "../controllers/Product.js";

const router = Router();

router.post("/addProductToCategory", auth, isSeller, addProductToCategory);
router.post("/createProduct", auth, isSeller, createProduct);
router.put("/editProduct", auth, isSeller, editProducts);
router.get("/getSellerProduct", auth, isSeller, getSellerProducts);
router.delete("/deleteProducts", auth, isSeller, deleteProduct);

export {
    router
};