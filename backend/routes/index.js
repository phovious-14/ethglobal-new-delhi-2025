import express from "express";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// Mount all routes
router.use("/users", userRoutes);

export default router;
