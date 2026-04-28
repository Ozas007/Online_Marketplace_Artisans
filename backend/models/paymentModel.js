import { getPool } from '../config/db.js'

const Payment = {
  async create(paymentData) {
    const pool = getPool()
    const {
      orderId,
      provider,
      externalId,
      status,
      amount,
      payerEmail
    } = paymentData

    await pool.execute(
      `INSERT INTO payments (order_id, provider, external_id, status, amount, payer_email, payer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, provider, externalId, status, amount, payerEmail, (paymentData.payerName || null)]
    )
  }
}

export default Payment
