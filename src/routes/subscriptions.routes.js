import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { controller as subscriptionsController } from "../controllers/subscriptions.controllers.js";

export const router = express.Router();

router.get("/plans", subscriptionsController.getPlans);
router.get("/me", authMiddleware, subscriptionsController.getMe);
router.post(
  "/",
  authMiddleware,
  upload.single("slip_image"),
  subscriptionsController.createSubscription,
);
