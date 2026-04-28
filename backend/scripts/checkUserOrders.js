import dotenv from 'dotenv'
import 'colors'
import connectDB, { getPool } from '../config/db.js'

dotenv.config()

const email = (process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error('Usage: node backend/scripts/checkUserOrders.js <email>')
  process.exit(1)
}

const run = async () => {
  await connectDB()
  const pool = getPool()
  const [u] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  console.log('user count', u.length)
  if (u.length === 0) {
    console.log('orders count', 0)
    process.exit(0)
  }
  const userId = u[0].id
  const [o] = await pool.execute('SELECT COUNT(*) c FROM orders WHERE user_id = ?', [userId])
  console.log('orders count', o[0].c)
  process.exit(0)
}

run().catch(e => {
  console.error(e.message)
  process.exit(1)
})
