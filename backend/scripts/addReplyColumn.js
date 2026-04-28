import dotenv from 'dotenv'
import colors from 'colors'
import connectDB, { getPool } from '../config/db.js'

dotenv.config()

const addReplyColumn = async () => {
  try {
    await connectDB()
    const pool = getPool()

    console.log('Adding reply column to feedbacks table...'.cyan)
    
    const [columns] = await pool.execute('SHOW COLUMNS FROM feedbacks')
    const columnNames = columns.map(c => c.Field)

    if (!columnNames.includes('reply')) {
      console.log('Adding reply column...')
      await pool.execute('ALTER TABLE feedbacks ADD COLUMN reply TEXT NULL AFTER message')
    }

    if (!columnNames.includes('repliedAt')) {
      console.log('Adding repliedAt column...')
      await pool.execute('ALTER TABLE feedbacks ADD COLUMN repliedAt TIMESTAMP NULL AFTER reply')
    }

    console.log('Feedbacks table updated with reply columns!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

addReplyColumn()
