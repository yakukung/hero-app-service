import express from "express";
import { controller as postsController } from "../controllers/posts.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();

router.get("/", postsController.getAll);
router.get("/:id", postsController.getById);
router.post("/create", authMiddleware, postsController.create);
router.post("/:id/like", authMiddleware, postsController.like);
router.delete("/:id/like", authMiddleware, postsController.unlike);
router.post("/:id/comment", authMiddleware, postsController.comment);
router.delete("/:id/comment/:commentId", postsController.deleteComment);
router.post("/:id/share", authMiddleware, postsController.share);
