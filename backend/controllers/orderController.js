import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Product from "../models/productModel.js";
import Cart from "../models/cartModel.js";

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.countInStock < item.qty) {
          res.status(400);
          throw new Error(`Not enough stock for ${product.name}`);
        }
        await Product.updateStock(item.product, item.qty);
      }
    }

    const createdOrder = await Order.create({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    await Cart.clearCart(req.user._id);

    res.status(201).json(createdOrder);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByIdWithUser(req.params.id);

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const updatedOrder = await Order.updateToPaid(req.params.id, {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    });

    try {
      await Payment.create({
        orderId: updatedOrder._id,
        provider: req.body.provider || 'PayPal',
        externalId: req.body.id,
        status: req.body.status,
        amount: updatedOrder.totalPrice,
        payerEmail: req.body.payer?.email_address,
        payerName: req.user?.name,
      });
    } catch (e) {}

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const updatedOrder = await Order.updateToDelivered(req.params.id);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findByUser(req.user._id);
  res.json(orders);
});

const getOrders = asyncHandler(async (req, res) => {
  let orders;
  if (req.user.isAdminSeller) {
    // Get orders for seller (only their items)
    orders = await Order.findBySeller(req.user._id);
  } else {
    // Admin gets all orders
    orders = await Order.findAll();
  }
  res.json(orders);
});

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
};
