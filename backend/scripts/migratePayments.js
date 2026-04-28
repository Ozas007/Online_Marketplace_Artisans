import dotenv from 'dotenv'
import colors from 'colors'
import connectDB, { getPool } from '../config/db.js'
import Payment from '../models/paymentModel.js'

dotenv.config()

const migratePayments = async () => {
  try {
    await connectDB()
    const pool = getPool()

    console.log('Fetching paid orders...'.cyan)
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.isPaid = 1`
    )

    console.log(`Found ${orders.length} paid orders.`.cyan)

    for (const order of orders) {
      // Check if payment record already exists
      const [existing] = await pool.execute(
        'SELECT id FROM payments WHERE order_id = ?',
        [order.id]
      )

      if (existing.length === 0) {
        console.log(`Migrating payment for order ${order.id}...`.yellow)
        await Payment.create({
          orderId: order.id,
          provider: order.paymentMethod || 'PayPal',
          externalId: order.payment_id || 'MIGRATED',
          status: order.payment_status || 'COMPLETED',
          amount: order.totalPrice,
          payerEmail: order.payment_email_address || order.user_email,
          payerName: order.user_name,
        })
      } else {
        console.log(`Payment for order ${order.id} already exists. Skipping.`.grey)
      }
    }

    console.log('Migration completed successfully!'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

migratePayments()
