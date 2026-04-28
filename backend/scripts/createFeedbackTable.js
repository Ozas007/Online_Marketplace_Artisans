import dotenv from 'dotenv'
import colors from 'colors'
import connectDB, { getPool } from '../config/db.js'

dotenv.config()

const createFeedbackTable = async () => {
  try {
    await connectDB()
    const pool = getPool()

    console.log('Creating feedbacks table if it does not exist...'.cyan)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `)

    console.log('Feedbacks table ready!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

createFeedbackTable()
