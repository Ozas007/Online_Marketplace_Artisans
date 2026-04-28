import dotenv from 'dotenv'
import colors from 'colors'
import users from './data/users.js'
import products from './data/products.js'
import connectDB, { getPool } from './config/db.js'

dotenv.config()

const importData = async () => {
  try {
    await connectDB()
    const pool = getPool()
    const clear = process.argv.includes('--clear')
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      provider VARCHAR(100) NOT NULL,
      external_id VARCHAR(255),
      status VARCHAR(100) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payer_email VARCHAR(255),
      payer_name VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )`)
    
    if (clear) {
      // Clear existing data (order matters due to foreign keys)
      await pool.execute('DELETE FROM order_items')
      await pool.execute('DELETE FROM orders')
      await pool.execute('DELETE FROM reviews')
      await pool.execute('DELETE FROM products')
      await pool.execute('DELETE FROM users')
      await pool.execute('DELETE FROM payments')
      await pool.execute("DELETE FROM products WHERE name = 'Sample name' AND price = 0")
      
      // Reset auto-increment counters
      await pool.execute('ALTER TABLE users AUTO_INCREMENT = 1')
      await pool.execute('ALTER TABLE products AUTO_INCREMENT = 1')
      await pool.execute('ALTER TABLE orders AUTO_INCREMENT = 1')
      await pool.execute('ALTER TABLE order_items AUTO_INCREMENT = 1')
      await pool.execute('ALTER TABLE reviews AUTO_INCREMENT = 1')
      await pool.execute('ALTER TABLE payments AUTO_INCREMENT = 1')
    }
    
    // Insert users
    const createdUserIds = []
    for (const user of users) {
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [user.email])
      if (existing.length > 0) {
        createdUserIds.push(existing[0].id)
      } else {
        const [result] = await pool.execute(
          'INSERT INTO users (name, email, password, isAdmin, isAdminSeller) VALUES (?, ?, ?, ?, ?)',
          [user.name, user.email, user.password, user.isAdmin || false, user.isAdminSeller || false]
        )
        createdUserIds.push(result.insertId)
      }
    }
    
    const adminUserId = createdUserIds[0]
    const sellerUserId = createdUserIds[1]
    const customerUserId = createdUserIds[2]
    
    // Insert products (alternate between seller and admin as owners)
    const insertedProductIds = []
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const ownerId = i % 2 === 0 ? sellerUserId : adminUserId
      const [existing] = await pool.execute('SELECT id, user_id, name, image, price FROM products WHERE name = ? LIMIT 1', [product.name])
      if (existing.length > 0) {
        insertedProductIds.push(existing[0])
      } else {
        await pool.execute(
          `INSERT INTO products (user_id, name, image, brand, category, description, rating, numReviews, price, countInStock)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ownerId,
            product.name,
            product.image,
            product.brand,
            product.category,
            product.description,
            product.rating || 0,
            product.numReviews || 0,
            product.price,
            product.countInStock
          ]
        )
        const [[last]] = await pool.execute('SELECT id, user_id, name, image, price FROM products WHERE name = ? ORDER BY id DESC LIMIT 1', [product.name])
        insertedProductIds.push(last)
      }
    }
    
    // Seed sample orders so admin/seller can see order history
    const [ordersCountRows] = await pool.execute('SELECT COUNT(*) as c FROM orders')
    const hasOrders = ordersCountRows[0].c > 0
    if (!hasOrders && insertedProductIds.length >= 2) {
      const pSeller = insertedProductIds.find(p => p.user_id === sellerUserId) || insertedProductIds[0]
      const pAdmin = insertedProductIds.find(p => p.user_id === adminUserId) || insertedProductIds[1]
      
      const itemsPrice = Number(pSeller.price) * 1 + Number(pAdmin.price) * 2
      const shippingPrice = itemsPrice > 100 ? 0 : 100
      const totalPrice = itemsPrice + shippingPrice
      
      // Create one order for the customer
      const [orderResult] = await pool.execute(
        `INSERT INTO orders (user_id, shipping_address, shipping_city, shipping_postalCode, shipping_country, paymentMethod, shippingPrice, totalPrice, isPaid, isDelivered, paidAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, NOW())`,
        [
          customerUserId,
          '221B Baker Street',
          'London',
          'NW1',
          'UK',
          'PayPal',
          shippingPrice,
          totalPrice
        ]
      )
      const orderId = orderResult.insertId
      
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, seller_id, name, qty, image, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, pSeller.id, pSeller.user_id, pSeller.name, 1, pSeller.image, pSeller.price]
      )
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, seller_id, name, qty, image, price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, pAdmin.id, pAdmin.user_id, pAdmin.name, 2, pAdmin.image, pAdmin.price]
      )

      // Also seed a payment record for this order
      await pool.execute(
        `INSERT INTO payments (order_id, provider, external_id, status, amount, payer_email, payer_name)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, 'PayPal', 'SEED_PAYMENT_123', 'COMPLETED', totalPrice, 'customer@example.com', 'Test Customer']
      )
    }
    
    console.log('Data Imported!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await connectDB()
    const pool = getPool()
    
    // Clear data (order matters due to foreign keys)
    await pool.execute('DELETE FROM order_items')
    await pool.execute('DELETE FROM orders')
    await pool.execute('DELETE FROM reviews')
    await pool.execute('DELETE FROM products')
    await pool.execute('DELETE FROM users')
    
    console.log('Data Destroyed!'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
