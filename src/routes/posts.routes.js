import express from "express";
import { controller as postsController } from "../controllers/posts.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const router = express.Router();

router.get("/", postsController.getAll);
router.post("/create", authMiddleware, postsController.create);
