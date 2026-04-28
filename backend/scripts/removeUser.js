import dotenv from 'dotenv'
import 'colors'
import connectDB, { getPool } from '../config/db.js'

dotenv.config()

const email = (process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error('Usage: node backend/scripts/removeUser.js <email>')
  process.exit(1)
}

const run = async () => {
  try {
    await connectDB()
    const pool = getPool()
    const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      console.log('User not found:', email)
      process.exit(0)
    }
    const id = rows[0].id
    await pool.execute('DELETE FROM users WHERE id = ?', [id])
    console.log('Deleted user and cascading data for:', email)
    process.exit(0)
  } catch (e) {
    console.error('Error removing user:', e.message)
    process.exit(1)
  }
}

run()
