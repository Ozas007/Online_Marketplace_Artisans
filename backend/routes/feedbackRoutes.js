import express from 'express'
const router = express.Router()
import { sendFeedback, getFeedbacks, deleteFeedback, replyToFeedback, getMyFeedbacks } from '../controllers/feedbackController.js'
import { protect, admin, admin_or_seller } from '../middleware/authMiddleware.js'

router.route('/')
  .post(protect, sendFeedback)
  .get(protect, admin, getFeedbacks)

router.route('/my').get(protect, getMyFeedbacks)

router.route('/:id')
  .delete(protect, admin, deleteFeedback)

router.route('/:id/reply')
  .put(protect, admin, replyToFeedback)

export default router
