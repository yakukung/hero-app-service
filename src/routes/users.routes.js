import express from "express";
import { controller as usersController } from "../controllers/users.controllers.js";
import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();
router.get("/:id", usersController.getById);
router.get("/", usersController.getAll);
router.post("/:id/follow", authMiddleware, usersController.follow);
router.delete("/:id/follow", authMiddleware, usersController.unfollow);
router.patch("/update-password", usersController.updatePassword);
router.patch("/update-username", usersController.updateUsername);
router.patch("/update-email", usersController.updateEmail);
router.patch("/update-status-flag/:id", usersController.updateStatusFlag);
router.put(
  "/update-profile-image",
  upload.single("profile_image"),
  usersController.updateProfileImage,
);

router.patch("/update-keyword/:id", usersController.updateKeyword);
