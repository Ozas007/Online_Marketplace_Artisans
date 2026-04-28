import dotenv from 'dotenv'
import colors from 'colors'
import connectDB, { getPool } from '../config/db.js'

dotenv.config()

const updateFeedbackTable = async () => {
  try {
    await connectDB()
    const pool = getPool()

    console.log('Updating feedbacks table schema...'.cyan)
    
    const [columns] = await pool.execute('SHOW COLUMNS FROM feedbacks')
    const columnNames = columns.map(c => c.Field)

    if (!columnNames.includes('recipient_id')) {
      console.log('Adding recipient_id column...')
      await pool.execute('ALTER TABLE feedbacks ADD COLUMN recipient_id INT NULL AFTER user_id')
    }

    if (!columnNames.includes('type')) {
      console.log('Adding type column...')
      await pool.execute("ALTER TABLE feedbacks ADD COLUMN type ENUM('ADMIN', 'SELLER') DEFAULT 'ADMIN' AFTER recipient_id")
    }

    // Add foreign key for recipient_id
    try {
      await pool.execute(`
        ALTER TABLE feedbacks
        ADD CONSTRAINT fk_feedbacks_recipient
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
      `)
    } catch (e) {
      // Ignore if already exists
    }

    console.log('Feedbacks table schema updated!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

updateFeedbackTable()
