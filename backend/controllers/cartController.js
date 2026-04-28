import asyncHandler from 'express-async-handler'
import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'

const getCart = asyncHandler(async (req, res) => {
  const cartItems = await Cart.getCartByUser(req.user._id)

  const cartWithStock = await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item.product)
      return {
        ...item,
        countInStock: product ? product.countInStock : 0,
        isSoldOut: product ? product.countInStock === 0 : true
      }
    })
  )

  res.json(cartWithStock)
})

const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body

  if (!productId) {
    res.status(400)
    throw new Error('Product ID is required')
  }

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.countInStock < qty) {
    res.status(400)
    throw new Error('Not enough stock available')
  }

  const cartItems = await Cart.addToCart(req.user._id, productId, qty)

  const cartWithStock = await Promise.all(
    cartItems.map(async (item) => {
      const p = await Product.findById(item.product)
      return {
        ...item,
        countInStock: p ? p.countInStock : 0,
        isSoldOut: p ? p.countInStock === 0 : true
      }
    })
  )

  res.json(cartWithStock)
})

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body

  if (!productId || qty === undefined) {
    res.status(400)
    throw new Error('Product ID and quantity are required')
  }

  if (qty < 1) {
    res.status(400)
    throw new Error('Quantity must be at least 1')
  }

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.countInStock < qty) {
    res.status(400)
    throw new Error('Not enough stock available')
  }

  const cartItems = await Cart.updateCartItem(req.user._id, productId, qty)

  const cartWithStock = await Promise.all(
    cartItems.map(async (item) => {
      const p = await Product.findById(item.product)
      return {
        ...item,
        countInStock: p ? p.countInStock : 0,
        isSoldOut: p ? p.countInStock === 0 : true
      }
    })
  )

  res.json(cartWithStock)
})

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params

  if (!productId) {
    res.status(400)
    throw new Error('Product ID is required')
  }

  const cartItems = await Cart.removeFromCart(req.user._id, productId)
  res.json(cartItems)
})

const clearCart = asyncHandler(async (req, res) => {
  await Cart.clearCart(req.user._id)
  res.json([])
})

const mergeCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body

  if (cartItems && cartItems.length > 0) {
    for (const item of cartItems) {
      await Cart.addToCart(req.user._id, item.product, item.qty)
    }
  }

  const finalCart = await Cart.getCartByUser(req.user._id)
  
  const cartWithStock = await Promise.all(
    finalCart.map(async (item) => {
      const p = await Product.findById(item.product)
      return {
        ...item,
        countInStock: p ? p.countInStock : 0,
        isSoldOut: p ? p.countInStock === 0 : true
      }
    })
  )

  res.json(cartWithStock)
})

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
}