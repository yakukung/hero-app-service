import express from "express";
import { controller as sheetsController } from "../controllers/sheets.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();
import { upload } from "../middleware/upload.middleware.js";

router.get("/", sheetsController.getAll);
router.get("/:id", sheetsController.getById);
router.post(
  "/create",
  authMiddleware,
  upload.array("images", 10),
  sheetsController.create
);
