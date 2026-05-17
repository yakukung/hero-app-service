import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { controller as quizController } from "../controllers/quiz.controllers.js";

export const router = express.Router();

router.post("/results", authMiddleware, quizController.submitResult);
router.get("/results/:sheetId", authMiddleware, quizController.getResult);
