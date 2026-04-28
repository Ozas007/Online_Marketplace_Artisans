import { getPool } from '../config/db.js'

const Order = {
  // Create order
  async create(orderData) {
    const pool = getPool()
    const {
      user,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      totalPrice
    } = orderData
    
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Insert order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (user_id, shipping_address, shipping_city, shipping_postalCode, shipping_country, 
         paymentMethod, shippingPrice, totalPrice) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user,
          shippingAddress.address,
          shippingAddress.city,
          shippingAddress.postalCode,
          shippingAddress.country,
          paymentMethod,
          shippingPrice,
          totalPrice
        ]
      )
      
      const orderId = orderResult.insertId
      
      // Insert order items
      for (const item of orderItems) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, seller_id, name, qty, image, price) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product, item.sellerId, item.name, item.qty, item.image, item.price]
        )
      }
      
      await connection.commit()
      
      return await Order.findById(orderId)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  // Find order by ID
  async findById(id) {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id])
    
    if (rows[0]) {
      const order = rows[0]
      const orderItems = await Order.getOrderItems(id)
      
      return {
        _id: order.id,
        user: order.user_id,
        orderItems,
        shippingAddress: {
          address: order.shipping_address,
          city: order.shipping_city,
          postalCode: order.shipping_postalCode,
          country: order.shipping_country
        },
        paymentMethod: order.paymentMethod,
        paymentResult: order.payment_id ? {
          id: order.payment_id,
          status: order.payment_status,
          update_time: order.payment_update_time,
          email_address: order.payment_email_address
        } : undefined,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        isPaid: Boolean(order.isPaid),
        paidAt: order.paidAt,
        isDelivered: Boolean(order.isDelivered),
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    }
    return null
  },

  // Find order by ID with user info populated
  async findByIdWithUser(id) {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [id]
    )
    
    if (rows[0]) {
      const order = rows[0]
      const orderItems = await Order.getOrderItems(id)
      
      return {
        _id: order.id,
        user: {
          _id: order.user_id,
          id: order.user_id,
          name: order.user_name,
          email: order.user_email
        },
        orderItems,
        shippingAddress: {
          address: order.shipping_address,
          city: order.shipping_city,
          postalCode: order.shipping_postalCode,
          country: order.shipping_country
        },
        paymentMethod: order.paymentMethod,
        paymentResult: order.payment_id ? {
          id: order.payment_id,
          status: order.payment_status,
          update_time: order.payment_update_time,
          email_address: order.payment_email_address
        } : undefined,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
        isPaid: Boolean(order.isPaid),
        paidAt: order.paidAt,
        isDelivered: Boolean(order.isDelivered),
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    }
    return null
  },

  // Get order items
  async getOrderItems(orderId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    )
    
    return rows.map(item => ({
      _id: item.id,
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product_id,
      sellerId: item.seller_id
    }))
  },

  // Find orders by user
  async findByUser(userId) {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY createdAt DESC',
      [userId]
    )
    
    const orders = await Promise.all(
      rows.map(async (order) => {
        const orderItems = await Order.getOrderItems(order.id)
        return {
          _id: order.id,
          user: order.user_id,
          orderItems,
          shippingAddress: {
            address: order.shipping_address,
            city: order.shipping_city,
            postalCode: order.shipping_postalCode,
            country: order.shipping_country
          },
          paymentMethod: order.paymentMethod,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
          isPaid: Boolean(order.isPaid),
          paidAt: order.paidAt,
          isDelivered: Boolean(order.isDelivered),
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      })
    )
    
    return orders
  },

  // Find all orders (admin)
  async findAll() {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT o.*, u.id as user_id, u.name as user_name 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.createdAt DESC`
    )
    
    const orders = await Promise.all(
      rows.map(async (order) => {
        const orderItems = await Order.getOrderItems(order.id)
        return {
          _id: order.id,
          user: {
            _id: order.user_id,
            id: order.user_id,
            name: order.user_name
          },
          orderItems,
          shippingAddress: {
            address: order.shipping_address,
            city: order.shipping_city,
            postalCode: order.shipping_postalCode,
            country: order.shipping_country
          },
          paymentMethod: order.paymentMethod,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
          isPaid: Boolean(order.isPaid),
          paidAt: order.paidAt,
          isDelivered: Boolean(order.isDelivered),
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      })
    )
    
    return orders
  },

  // Find orders by seller
  async findBySeller(sellerId) {
    const pool = getPool()
    
    // Get orders that have items from this seller
    const [orderIds] = await pool.execute(
      'SELECT DISTINCT order_id FROM order_items WHERE seller_id = ?',
      [sellerId]
    )
    
    if (orderIds.length === 0) return []
    
    const orders = await Promise.all(
      orderIds.map(async ({ order_id }) => {
        const [orderRows] = await pool.execute(
          `SELECT o.*, u.id as user_id, u.name as user_name 
           FROM orders o 
           JOIN users u ON o.user_id = u.id 
           WHERE o.id = ?`,
          [order_id]
        )
        
        if (!orderRows[0]) return null
        
        const order = orderRows[0]
        
        // Get only items from this seller
        const [itemRows] = await pool.execute(
          'SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?',
          [order_id, sellerId]
        )
        
        const orderItems = itemRows.map(item => ({
          _id: item.id,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.product_id,
          sellerId: item.seller_id
        }))
        
        return {
          _id: order.id,
          user: {
            _id: order.user_id,
            id: order.user_id,
            name: order.user_name
          },
          orderItems,
          shippingAddress: {
            address: order.shipping_address,
            city: order.shipping_city,
            postalCode: order.shipping_postalCode,
            country: order.shipping_country
          },
          paymentMethod: order.paymentMethod,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
          isPaid: Boolean(order.isPaid),
          paidAt: order.paidAt,
          isDelivered: Boolean(order.isDelivered),
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      })
    )
    
    return orders.filter(o => o !== null).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  },

  // Update order to paid
  async updateToPaid(id, paymentResult) {
    const pool = getPool()
    
    await pool.execute(
      `UPDATE orders SET isPaid = TRUE, paidAt = NOW(), 
       payment_id = ?, payment_status = ?, payment_update_time = ?, payment_email_address = ?
       WHERE id = ?`,
      [
        paymentResult.id,
        paymentResult.status,
        paymentResult.update_time,
        paymentResult.email_address,
        id
      ]
    )
    
    return await Order.findById(id)
  },

  // Update order to delivered
  async updateToDelivered(id) {
    const pool = getPool()
    
    // Check if it's COD and not paid yet
    const [rows] = await pool.execute('SELECT paymentMethod, isPaid FROM orders WHERE id = ?', [id])
    if (rows[0] && rows[0].paymentMethod === 'COD' && !rows[0].isPaid) {
      await pool.execute(
        'UPDATE orders SET isDelivered = TRUE, deliveredAt = NOW(), isPaid = TRUE, paidAt = NOW() WHERE id = ?',
        [id]
      )
    } else {
      await pool.execute(
        'UPDATE orders SET isDelivered = TRUE, deliveredAt = NOW() WHERE id = ?',
        [id]
      )
    }
    
    return await Order.findById(id)
  },
}

export default Order
