import express from "express";
import { controller as usersController } from "../controllers/users.controllers.js";
import { upload } from "../middleware/upload.middleware.js";

export const router = express.Router();
router.put(
  "/update-profile",
  upload.single("profile_image"),
  usersController.updateProfile,
);
router.get("/:id", usersController.getById);
