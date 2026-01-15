import express from "express";
import { controller as usersController } from "../controllers/users.controllers.js";

export const router = express.Router();
router.get("/:id", usersController.getById);
