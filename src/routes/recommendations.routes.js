import express from "express";
import { controller as recommendationsController } from "../controllers/recommendations.controllers.js";

export const router = express.Router();

router.get("/", recommendationsController.list);
