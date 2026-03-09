import express from "express";
import { controller as sheetsController } from "../controllers/sheets.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();
import { upload } from "../middleware/upload.middleware.js";

router.get("/favorites", authMiddleware, sheetsController.getFavorites);
router.get("/", sheetsController.getAll);
router.get("/user/:user_id", sheetsController.getByUserId);
router.get("/:id", sheetsController.getById);
router.delete("/:id", authMiddleware, sheetsController.deleteSheet);
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
