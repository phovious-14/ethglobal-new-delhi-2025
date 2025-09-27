import express from "express";
import userRoutes from "./userRoutes.js";
import streamRoutes from "./streamRoutes.js";
import instantRoutes from "./instantRoute.js";

const router = express.Router();

// Mount all routes
router.use("/users", userRoutes);
router.use("/streams", streamRoutes);
router.use("/instant", instantRoutes);

export default router;
