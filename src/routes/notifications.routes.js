import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { controller as notificationsController } from "../controllers/notifications.controllers.js";

export const router = express.Router();

router.get("/", authMiddleware, notificationsController.list);
router.patch("/:id/read", authMiddleware, notificationsController.markRead);
