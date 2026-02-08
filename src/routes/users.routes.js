import express from "express";
import { controller as usersController } from "../controllers/users.controllers.js";
import { upload } from "../middleware/upload.middleware.js";

export const router = express.Router();
router.put(
  "/update-profile-image",
  upload.single("profile_image"),
  usersController.updateProfileImage,
);
router.patch(
  "/update-profile",
  upload.single("profile_image"),
  usersController.updateProfile,
);
router.patch("/update-password", usersController.updatePassword);
router.patch("/update-username", usersController.updateUsername);
router.patch("/update-email", usersController.updateEmail);
router.get("/:id", usersController.getById);
router.get("/", usersController.getAll);
