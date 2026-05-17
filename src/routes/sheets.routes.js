import express from "express";
import { controller as sheetsController } from "../controllers/sheets.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();
import { upload } from "../middleware/upload.middleware.js";

router.get("/favorites", authMiddleware, sheetsController.getFavorites);
router.get("/purchased", authMiddleware, sheetsController.getPurchased);
router.get("/", sheetsController.getAll);
router.get("/user/:user_id", sheetsController.getByUserId);
router.get("/:id/reviews", sheetsController.getReviews);
router.post("/:id/reviews", authMiddleware, sheetsController.upsertReview);
router.patch(
  "/:id/reviews/:reviewId",
  authMiddleware,
  sheetsController.updateReview,
);
router.delete(
  "/:id/reviews/:reviewId",
  authMiddleware,
  sheetsController.deleteReview,
);
router.get("/:id", sheetsController.getById);
router.patch("/:id", authMiddleware, sheetsController.updateSheet);
router.delete("/:id", authMiddleware, sheetsController.deleteSheet);
router.post("/:id/purchase", authMiddleware, sheetsController.purchase);
router.post(
  "/create",
  authMiddleware,
  upload.array("files", 10),
  sheetsController.create,
);

router.post(
  "/sheet-favorites",
  authMiddleware,
  sheetsController.sheetFavorites,
);
router.post(
  "/sheet-unfavorites",
  authMiddleware,
  sheetsController.sheetUnFavorites,
);
