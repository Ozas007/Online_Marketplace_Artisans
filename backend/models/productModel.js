import { getPool } from '../config/db.js'

const Product = {
  // Find all products with pagination and search
  async findAll(keyword = '', page = 1, pageSize = 8) {
    const pool = getPool()
    const offset = (page - 1) * pageSize
    
    let query = 'SELECT * FROM products'
    let countQuery = 'SELECT COUNT(*) as count FROM products'
    let countParams = []
    let queryParams = []
    
    if (keyword) {
      query += ' WHERE name LIKE ?'
      countQuery += ' WHERE name LIKE ?'
      countParams.push(`%${keyword}%`)
      queryParams.push(`%${keyword}%`)
    }
    
    query += ` ORDER BY createdAt DESC LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}`
    
    const [countRows] = await pool.execute(countQuery, countParams)
    const count = countRows[0].count
    
    const [rows] = await pool.execute(query, queryParams)
    
    // Add _id field for frontend compatibility and fetch reviews
    const productsWithReviews = await Promise.all(
      rows.map(async (row) => {
        const reviews = await Product.getReviews(row.id)
        return {
          ...row,
          _id: row.id,
          user: row.user_id,
          reviews
        }
      })
    )
    
    return {
      products: productsWithReviews,
      page,
      pages: Math.ceil(count / pageSize),
      count
    }
  },

  // Find products by seller/user
  async findByUser(userId, keyword = '', page = 1, pageSize = 10) {
    const pool = getPool()
    const offset = (page - 1) * pageSize
    
    let query = 'SELECT * FROM products WHERE user_id = ?'
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE user_id = ?'
    let countParams = [userId]
    let queryParams = [userId]
    
    if (keyword) {
      query += ' AND name LIKE ?'
      countQuery += ' AND name LIKE ?'
      countParams.push(`%${keyword}%`)
      queryParams.push(`%${keyword}%`)
    }
    
    const [countRows] = await pool.execute(countQuery, countParams)
    const count = countRows[0].count
    
    query += ` ORDER BY createdAt DESC LIMIT ${parseInt(pageSize)} OFFSET ${parseInt(offset)}`
    
    const [rows] = await pool.execute(query, queryParams)
    
    const productsWithReviews = await Promise.all(
      rows.map(async (row) => {
        const reviews = await Product.getReviews(row.id)
        return {
          ...row,
          _id: row.id,
          user: row.user_id,
          reviews
        }
      })
    )
    
    return {
      products: productsWithReviews,
      page,
      pages: Math.ceil(count / pageSize),
      count
    }
  },

  // Find product by ID
  async findById(id) {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id])
    
    if (rows[0]) {
      const reviews = await Product.getReviews(id)
      return {
        ...rows[0],
        _id: rows[0].id,
        user: rows[0].user_id,
        reviews
      }
    }
    return null
  },

  // Create product
  async create(productData) {
    const pool = getPool()
    const {
      user,
      name,
      price,
      image,
      brand,
      category,
      countInStock,
      numReviews,
      description
    } = productData
    
    const [result] = await pool.execute(
      `INSERT INTO products (user_id, name, price, image, brand, category, countInStock, numReviews, description, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [user, name, price, image, brand, category, countInStock, numReviews, description]
    )
    
    return await Product.findById(result.insertId)
  },

  // Update product
  async update(id, productData) {
    const pool = getPool()
    const { name, price, description, image, brand, category, countInStock } = productData
    
    await pool.execute(
      `UPDATE products SET name = ?, price = ?, description = ?, image = ?, brand = ?, category = ?, countInStock = ?
       WHERE id = ?`,
      [name, price, description, image, brand, category, countInStock, id]
    )
    
    return await Product.findById(id)
  },

  // Delete product
  async delete(id) {
    const pool = getPool()
    await pool.execute('DELETE FROM products WHERE id = ?', [id])
    return { message: 'Product removed' }
  },

  // Get top rated products
  async findTopRated(limit = 3) {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT * FROM products 
       WHERE NOT (name = 'Sample name' AND price = 0)
       ORDER BY rating DESC LIMIT ${parseInt(limit)}`
    )
    
    const productsWithReviews = await Promise.all(
      rows.map(async (row) => {
        const reviews = await Product.getReviews(row.id)
        return {
          ...row,
          _id: row.id,
          user: row.user_id,
          reviews
        }
      })
    )
    
    return productsWithReviews
  },

  // Get reviews for a product
  async getReviews(productId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY createdAt DESC',
      [productId]
    )
    return rows.map(row => ({
      ...row,
      _id: row.id,
      user: row.user_id
    }))
  },

  // Add review to product
  async addReview(productId, reviewData) {
    const pool = getPool()
    const { name, rating, comment, user } = reviewData
    
    // Check if already reviewed
    const [existing] = await pool.execute(
      'SELECT * FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, user]
    )
    
    if (existing.length > 0) {
      return { alreadyReviewed: true }
    }
    
    // Add review
    await pool.execute(
      'INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [productId, user, name, rating, comment]
    )
    
    // Update product rating and numReviews
    const [reviews] = await pool.execute(
      'SELECT AVG(rating) as avgRating, COUNT(*) as numReviews FROM reviews WHERE product_id = ?',
      [productId]
    )
    
    await pool.execute(
      'UPDATE products SET rating = ?, numReviews = ? WHERE id = ?',
      [reviews[0].avgRating || 0, reviews[0].numReviews, productId]
    )
    
    return { success: true }
  },

  // Update stock
  async updateStock(id, qty) {
    const pool = getPool()
    await pool.execute(
      'UPDATE products SET countInStock = countInStock - ? WHERE id = ?',
      [qty, id]
    )
  },

  // Get current stock
  async getStock(id) {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT countInStock FROM products WHERE id = ?', [id])
    return rows[0]?.countInStock || 0
  },

  // Get multiple products by IDs
  async findByIds(ids) {
    if (!ids || ids.length === 0) return []
    const pool = getPool()
    const placeholders = ids.map(() => '?').join(',')
    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE id IN (${placeholders})`,
      ids
    )
    return rows.map(row => ({
      ...row,
      _id: row.id,
      user: row.user_id
    }))
  }
}

export default Product
