import express from 'express'
const router = express.Router()
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
} from '../controllers/cartController.js'
import { protect } from '../middleware/authMiddleware.js'

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)

router.route('/merge').post(protect, mergeCart)

router.route('/:productId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart)

router.route('/clear').delete(protect, clearCart)

export default router