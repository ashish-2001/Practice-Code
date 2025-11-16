import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { createMessage, getAllMessages, updateMessages } from "../controllers/Contact.js";

const router = Router();

router.post("/createMessage", auth, createMessage);
router.post("/getAllMessages", getAllMessages);
router.put("/updateMessages", auth, updateMessages);