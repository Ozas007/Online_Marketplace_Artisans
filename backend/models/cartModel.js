import { getPool } from '../config/db.js'

const Cart = {
  async getCartByUser(userId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT c.*, p.name, p.image, p.price, p.countInStock, p.user_id as sellerId
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    )

    return rows.map(row => ({
      _id: row.id,
      user: row.user_id,
      product: row.product_id,
      sellerId: row.sellerId,
      name: row.name,
      image: row.image,
      price: parseFloat(row.price),
      countInStock: row.countInStock,
      qty: row.qty,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }))
  },

  async addToCart(userId, productId, qty = 1) {
    const pool = getPool()
    const [existing] = await pool.execute(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )

    if (existing.length > 0) {
      const newQty = existing[0].qty + qty
      await pool.execute(
        'UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ?',
        [newQty, userId, productId]
      )
    } else {
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, ?)',
        [userId, productId, qty]
      )
    }

    return await Cart.getCartByUser(userId)
  },

  async updateCartItem(userId, productId, qty) {
    const pool = getPool()
    await pool.execute(
      'UPDATE cart SET qty = ? WHERE user_id = ? AND product_id = ?',
      [qty, userId, productId]
    )
    return await Cart.getCartByUser(userId)
  },

  async removeFromCart(userId, productId) {
    const pool = getPool()
    await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    return await Cart.getCartByUser(userId)
  },

  async clearCart(userId) {
    const pool = getPool()
    await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId])
    return []
  },

  async getCartItem(userId, productId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    return rows[0] || null
  }
}

export default Cart