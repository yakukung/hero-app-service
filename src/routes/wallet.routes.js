import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { controller as walletController } from "../controllers/wallet.controllers.js";

export const router = express.Router();

router.get("/top-ups", authMiddleware, walletController.getTopUps);
router.get("/topups", authMiddleware, walletController.getTopUps);
router.post(
  "/top-ups",
  authMiddleware,
  upload.fields([
    { name: "slip_image", maxCount: 1 },
    { name: "slipImage", maxCount: 1 },
  ]),
  walletController.createTopUp,
);
router.post(
  "/topups",
  authMiddleware,
  upload.fields([
    { name: "slip_image", maxCount: 1 },
    { name: "slipImage", maxCount: 1 },
  ]),
  walletController.createTopUp,
);
