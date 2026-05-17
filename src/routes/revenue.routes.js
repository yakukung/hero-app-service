import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { controller as revenueController } from "../controllers/revenue.controllers.js";

export const router = express.Router();

router.get("/creator", authMiddleware, revenueController.getCreatorRevenue);
