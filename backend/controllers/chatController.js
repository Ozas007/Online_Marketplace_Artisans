import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import Order from '../models/orderModel.js'

const ensureChatKey = (req) => {
  const key = req.headers['x-chat-api-key'] || req.query.apiKey
  const expected = process.env.CHAT_API_KEY
  return expected && key && key === expected
}

export const ordersByEmail = asyncHandler(async (req, res) => {
  if (!ensureChatKey(req)) {
    res.status(401)
    throw new Error('Unauthorized')
  }
  const email = (req.query.email || '').trim().toLowerCase()
  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }
  const user = await User.findByEmail(email)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  const orders = await Order.findByUser(user.id)
  const sanitized = orders.map((o) => ({
    id: o._id,
    total: o.totalPrice,
    isPaid: o.isPaid,
    paidAt: o.paidAt,
    isDelivered: o.isDelivered,
    deliveredAt: o.deliveredAt,
    createdAt: o.createdAt,
    items: o.orderItems?.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
    })),
  }))
  res.json({ email, count: sanitized.length, orders: sanitized })
})

export const orderByIdForEmail = asyncHandler(async (req, res) => {
  if (!ensureChatKey(req)) {
    res.status(401)
    throw new Error('Unauthorized')
  }
  const email = (req.query.email || '').trim().toLowerCase()
  const orderId = req.params.id
  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }
  const user = await User.findByEmail(email)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  const order = await Order.findByIdWithUser(orderId)
  if (!order || Number(order.user._id) !== Number(user.id)) {
    res.status(404)
    throw new Error('Order not found for this user')
  }
  const result = {
    id: order._id,
    total: order.totalPrice,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    items: order.orderItems?.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
    })),
    shipping: {
      city: order.shippingAddress?.city,
      country: order.shippingAddress?.country,
    },
  }
  res.json(result)
})
