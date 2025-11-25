import express from "express";
import { auth, isAdmin, isSeller, isCustomer } from "../middlewares/auth";
import Router from "express";
import { createProduct, deleteProduct, editProducts, getAllProducts, getSellerProducts } from "../controllers/Product";

const router = express.Router();

router.post("/createProduct", auth, isSeller, createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getSellerProduct", isSeller, getSellerProducts);
router.put("/editProduct", isSeller, editProducts);
router.delete("/deleteProduct", isSeller, deleteProduct);

export {
    router
}