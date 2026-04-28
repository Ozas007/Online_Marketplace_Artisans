import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12
  const page = Number(req.query.pageNumber) || 1
  const keyword = req.query.keyword || ''

  const result = await Product.findAll(keyword, page, pageSize)
  res.json(result)
})

// @desc    Fetch seller's products
// @route   GET /api/products/seller
// @access  Private/SellerAdmin
const getSellerProducts = asyncHandler(async (req, res) => {
  const pageSize = 10
  const page = Number(req.query.pageNumber) || 1
  const keyword = req.query.keyword || ''

  const result = await Product.findByUser(req.user._id, keyword, page, pageSize)
  res.json(result)
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    await Product.delete(req.params.id)
    res.json({ message: 'Product removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const createdProduct = await Product.create({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    countInStock: 0,
    numReviews: 0,
    description: 'Sample description',
  })

  res.status(201).json(createdProduct)
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    const updatedProduct = await Product.update(req.params.id, {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
    })
    res.json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body

  const product = await Product.findById(req.params.id)

  if (product) {
    const result = await Product.addReview(req.params.id, {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    })

    if (result.alreadyReviewed) {
      res.status(400)
      throw new Error('Product already reviewed')
    }

    res.status(201).json({ message: 'Review added' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.findTopRated(3)
  res.json(products)
})

// @desc    Get stock for multiple products
// @route   GET /api/products/stock
// @access  Public
const getProductsStock = asyncHandler(async (req, res) => {
  const { ids } = req.query
  if (!ids) {
    res.status(400)
    throw new Error('Product IDs required')
  }
  const productIds = ids.split(',').map(id => parseInt(id))
  const products = await Product.findByIds(productIds)
  const stockInfo = products.map(p => ({
    productId: p._id,
    countInStock: p.countInStock,
    isSoldOut: p.countInStock === 0
  }))
  res.json(stockInfo)
})

export {
  getProducts,
  getSellerProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getProductsStock,
}
