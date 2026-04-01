import express from "express";
import { controller as usersController } from "../controllers/users.controllers.js";
import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();
router.get("/:id", usersController.getById);
router.get("/", usersController.getAll);
router.post("/:id/follow", authMiddleware, usersController.follow);
router.delete("/:id/follow", authMiddleware, usersController.unfollow);
router.patch("/update-password", authMiddleware, usersController.updatePassword);
router.patch("/update-username", authMiddleware, usersController.updateUsername);
router.patch("/update-email", authMiddleware, usersController.updateEmail);
router.patch(
  "/update-status-flag/:id",
  authMiddleware,
  usersController.updateStatusFlag,
);
router.put(
  "/update-profile-image",
  authMiddleware,
  upload.single("profile_image"),
  usersController.updateProfileImage,
);

router.patch("/update-keyword/:id", authMiddleware, usersController.updateKeyword);
