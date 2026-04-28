import asyncHandler from 'express-async-handler'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Order from '../models/orderModel.js'
import Payment from '../models/paymentModel.js'

// @desc    Create Razorpay order
// @route   POST /api/payments/razorpay/order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  }

  try {
    const order = await instance.orders.create(options)
    res.json(order)
  } catch (error) {
    res.status(500)
    throw new Error(error.message)
  }
})

// @desc    Verify Razorpay payment
// @route   POST /api/payments/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body

  const sign = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSign = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest('hex')

  if (razorpay_signature === expectedSign) {
    // Payment verified
    const order = await Order.findById(orderId)

    if (order) {
      // Update order to paid
      const paymentResult = {
        id: razorpay_payment_id,
        status: 'captured',
        update_time: new Date().toISOString(),
        email_address: req.user.email,
      }

      await Order.updateToPaid(orderId, paymentResult)

      // Record in payments table
      await Payment.create({
        orderId: orderId,
        userId: req.user._id,
        paymentProvider: 'Razorpay',
        amount: order.totalPrice,
      })

      res.json({ message: 'Payment verified successfully' })
    } else {
      res.status(404)
      throw new Error('Order not found')
    }
  } else {
    res.status(400)
    throw new Error('Invalid signature')
  }
})

export { createRazorpayOrder, verifyRazorpayPayment }
