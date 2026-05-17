import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { controller as paymentsController } from "../controllers/payments.controllers.js";

export const router = express.Router();

router.get("/history", authMiddleware, paymentsController.getHistory);
