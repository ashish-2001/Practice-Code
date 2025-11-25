import express, { Router } from "express";
import { createMessage, getAllMessages, updateMessageStatus } from "../controllers/Contact.js";

const router = express.Router();

router.post("/contact", createMessage);
router.get("/message", getAllMessages);
router.put("/updateMessageStatus", updateMessageStatus);

export {
    router
}