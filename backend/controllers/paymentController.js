import asyncHandler from "express-async-handler";
import { getPool } from '../config/db.js'

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const pool = getPool()
  const [rows] = await pool.execute(
    `SELECT p.*, o.user_id, u.name as user_name, u.email as user_email 
     FROM payments p 
     JOIN orders o ON p.order_id = o.id 
     JOIN users u ON o.user_id = u.id 
     ORDER BY p.createdAt DESC`
  )
  res.json(rows)
})

export { getPayments }
