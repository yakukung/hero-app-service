import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { controller as reportsController } from "../controllers/reports.controllers.js";

export const router = express.Router();

router.post("/", authMiddleware, reportsController.submit);
