import express from 'express'
import { controller as authController } from '../controllers/auth.controllers.js'

export const router = express.Router()
router.post('/register', authController.register)
router.post('/login', authController.login)
