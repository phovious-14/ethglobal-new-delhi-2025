import express from "express";
import { createStream, getStream, stopStreamStatus } from "../controllers/streamController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createStream);
router.get("/get/:walletAddress/:type/:chainId", authMiddleware, getStream); 
router.post("/stop-stream", authMiddleware, stopStreamStatus);

export default router;