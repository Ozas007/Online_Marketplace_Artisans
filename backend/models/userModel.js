import bcrypt from 'bcryptjs'
import { getPool } from '../config/db.js'

const User = {
  // Find user by email
  async findByEmail(email) {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
    return rows[0] || null
  },

  // Find user by ID
  async findById(id) {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id])
    return rows[0] || null
  },

  // Find user by ID excluding password
  async findByIdWithoutPassword(id) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT id, name, email, isAdmin, isAdminSeller, createdAt, updatedAt FROM users WHERE id = ?',
      [id]
    )
    if (rows[0]) {
      rows[0]._id = rows[0].id
    }
    return rows[0] || null
  },

  // Find all users
  async findAll() {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT id, name, email, isAdmin, isAdminSeller, createdAt, updatedAt FROM users'
    )
    return rows.map(row => ({ ...row, _id: row.id }))
  },

  // Create new user
  async create(userData) {
    const pool = getPool()
    const { name, email, password, isAdmin = false, isAdminSeller = false } = userData
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, isAdmin, isAdminSeller) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, isAdmin, isAdminSeller]
    )
    
    return {
      _id: result.insertId,
      id: result.insertId,
      name,
      email,
      isAdmin,
      isAdminSeller
    }
  },

  // Update user
  async update(id, userData) {
    const pool = getPool()
    const { name, email, password, isAdmin, isAdminSeller } = userData
    
    let query = 'UPDATE users SET name = ?, email = ?'
    let params = [name, email]
    
    if (isAdmin !== undefined) {
      query += ', isAdmin = ?'
      params.push(isAdmin)
    }
    
    if (isAdminSeller !== undefined) {
      query += ', isAdminSeller = ?'
      params.push(isAdminSeller)
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      query += ', password = ?'
      params.push(hashedPassword)
    }
    
    query += ' WHERE id = ?'
    params.push(id)
    
    await pool.execute(query, params)
    return await User.findById(id)
  },

  // Delete user
  async delete(id) {
    const pool = getPool()
    await pool.execute('DELETE FROM users WHERE id = ?', [id])
    return { message: 'User removed' }
  },

  // Match password
  async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword)
  }
}

export default User
