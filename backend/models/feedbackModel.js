import { getPool } from '../config/db.js'

class Feedback {
  // Save feedback to database
  static async create(feedbackData) {
    const pool = getPool()
    const { userId, recipientId, type, name, email, subject, message } = feedbackData

    const [result] = await pool.execute(
      'INSERT INTO feedbacks (user_id, recipient_id, type, name, email, subject, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId || null, recipientId || null, type || 'ADMIN', name, email, subject, message]
    )

    const [rows] = await pool.execute('SELECT * FROM feedbacks WHERE id = ?', [result.insertId])
    return rows[0]
  }

  // Fetch feedbacks for a specific recipient (or Admin)
  static async findByRecipient(recipientId, type = 'ADMIN') {
    const pool = getPool()
    let query = 'SELECT * FROM feedbacks '
    let params = []

    if (type === 'ADMIN') {
      query += "WHERE type = 'ADMIN' "
    } else {
      query += "WHERE type = 'SELLER' AND recipient_id = ? "
      params.push(recipientId)
    }

    query += 'ORDER BY createdAt DESC'
    const [rows] = await pool.execute(query, params)
    return rows
  }

  // Fetch all feedbacks (Super Admin view)
  static async findAll() {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM feedbacks ORDER BY createdAt DESC')
    return rows
  }

  // Delete feedback
  static async delete(id) {
    const pool = getPool()
    await pool.execute('DELETE FROM feedbacks WHERE id = ?', [id])
    return true
  }

  // Update feedback with a reply
  static async updateReply(id, reply) {
    const pool = getPool()
    await pool.execute(
      'UPDATE feedbacks SET reply = ?, repliedAt = NOW() WHERE id = ?',
      [reply, id]
    )
    const [rows] = await pool.execute('SELECT * FROM feedbacks WHERE id = ?', [id])
    return rows[0]
  }

  // Fetch feedbacks sent BY a specific user
  static async findByUserId(userId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM feedbacks WHERE user_id = ? ORDER BY createdAt DESC',
      [userId]
    )
    return rows
  }
}

export default Feedback
