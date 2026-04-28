import asyncHandler from 'express-async-handler'
import Feedback from '../models/feedbackModel.js'

// @desc    Receive feedback from contact form
// @route   POST /api/feedback
// @access  Private
const sendFeedback = asyncHandler(async (req, res) => {
  const { name, email, subject, message, recipientId, type } = req.body

  if (!name || !email || !subject || !message) {
    res.status(400)
    throw new Error('Please fill all fields')
  }

  const feedback = await Feedback.create({
    userId: req.user ? req.user._id : null,
    recipientId: recipientId || null,
    type: type || 'ADMIN',
    name,
    email,
    subject,
    message,
  })

  if (feedback) {
    res.status(201).json({ message: 'Feedback received' })
  } else {
    res.status(400)
    throw new Error('Invalid feedback data')
  }
})

// @desc    Get all feedbacks for Admin
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedbacks = asyncHandler(async (req, res) => {
  if (req.user.isAdmin) {
    const feedbacks = await Feedback.findByRecipient(null, 'ADMIN')
    res.json(feedbacks)
  } else {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
})

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = asyncHandler(async (req, res) => {
  const result = await Feedback.delete(req.params.id)
  if (result) {
    res.json({ message: 'Feedback removed' })
  } else {
    res.status(404)
    throw new Error('Feedback not found')
  }
})

// @desc    Reply to feedback
// @route   PUT /api/feedback/:id/reply
// @access  Private/Admin
const replyToFeedback = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(401)
    throw new Error('Not authorized as an admin')
  }
  const { reply } = req.body
  if (!reply) {
    res.status(400)
    throw new Error('Please provide a reply')
  }

  const feedback = await Feedback.updateReply(req.params.id, reply)
  if (feedback) {
    res.json(feedback)
  } else {
    res.status(404)
    throw new Error('Feedback not found')
  }
})

// @desc    Get feedbacks sent by user
// @route   GET /api/feedback/my
// @access  Private
const getMyFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.findByUserId(req.user._id)
  res.json(feedbacks)
})

export { sendFeedback, getFeedbacks, deleteFeedback, replyToFeedback, getMyFeedbacks }
