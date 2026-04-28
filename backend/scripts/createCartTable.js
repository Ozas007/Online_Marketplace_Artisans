import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import colors from 'colors'

dotenv.config()

const createCartTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'artisan_marketplace',
  })

  try {
    console.log('Creating cart table...'.cyan)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        qty INT NOT NULL DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `)
    console.log('Cart table created successfully!'.green.bold)
  } catch (error) {
    console.error(`Error creating cart table: ${error.message}`.red.bold)
  } finally {
    await connection.end()
  }
}

createCartTable()