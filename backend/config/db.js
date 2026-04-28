import mysql from 'mysql2/promise'

let pool = null

const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'artisan_marketplace',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // Test the connection
    const connection = await pool.getConnection()
    console.log(`MySQL Connected: ${process.env.DB_HOST || 'localhost'}`.cyan.underline)
    connection.release()
    
    return pool
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold)
    process.exit(1)
  }
}

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB first.')
  }
  return pool
}

export { connectDB, getPool }
export default connectDB
