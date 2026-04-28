import express from 'express'
import { getPayments } from '../controllers/paymentController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').get(protect, admin, getPayments)

export default router
