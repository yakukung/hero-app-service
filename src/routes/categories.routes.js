import express from "express";
import { controller as categoriesController } from "../controllers/categories.controllers.js";

export const router = express.Router();
router.get("/", categoriesController.getAll);
router.get("/:id", categoriesController.getById);
