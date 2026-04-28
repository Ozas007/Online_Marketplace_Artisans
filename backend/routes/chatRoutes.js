import express from 'express'
import { ordersByEmail, orderByIdForEmail } from '../controllers/chatController.js'

const router = express.Router()

router.get('/orders', ordersByEmail)
router.get('/orders/:id', orderByIdForEmail)

export default router
