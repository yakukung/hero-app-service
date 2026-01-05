import express from 'express'
import { controller as sheetsController } from '../controllers/sheets.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export const router = express.Router()
router.post('/create', authMiddleware, sheetsController.create)
