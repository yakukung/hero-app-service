import express from "express";
import { controller as postsController } from "../controllers/posts.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();

router.get("/", postsController.getAll);
router.get("/user/:userId", postsController.getByUserId);
router.get("/user/:userId/shared", postsController.getSharedByUserId);
router.get("/:id", postsController.getById);
router.post("/create", authMiddleware, postsController.create);
router.post("/:id/like", authMiddleware, postsController.like);
router.delete("/:id/like", authMiddleware, postsController.unlike);
router.get("/:id/comments", postsController.getComments);
router.post("/:id/comment", authMiddleware, postsController.comment);
router.delete("/:id/comment/:commentId", authMiddleware, postsController.deleteComment);
router.patch("/:id", authMiddleware, postsController.update);
router.delete("/:id", authMiddleware, postsController.delete);
router.post("/:id/share", authMiddleware, postsController.share);
router.delete("/:id/share", authMiddleware, postsController.unshare);
