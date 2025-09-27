import express from "express";
import { createInstant, getInstant } from "../controllers/instantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createInstant);
router.get("/get/:walletAddress/:type/:chainId", authMiddleware, getInstant);


export default router;