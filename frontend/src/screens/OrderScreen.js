import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button, Form, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import {
  ORDER_PAY_SUCCESS,
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants'

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id

  const dispatch = useDispatch()

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  if (!loading && order && order.orderItems) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )
  }

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    }

    if (!order || successPay || successDeliver || Number(order._id) !== Number(orderId)) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    }
    // eslint-disable-next-line
  }, [dispatch, orderId, successPay, successDeliver, order, history, userInfo])

  const successPaymentHandler = (paymentResult) => {
    console.log(paymentResult)
    dispatch(payOrder(orderId, paymentResult))
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order))
  }
  
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardError, setCardError] = useState('')
  
  const [upiId, setUpiId] = useState('')
  const [upiError, setUpiError] = useState('')
  
  const payByCardHandler = (e) => {
    e.preventDefault()
    setCardError('')
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setCardError('Please fill all card details')
      return
    }
    // Simulate validation: 16 digits card number, 3-digit CVV, MM/YY
    const digitsOnly = cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(digitsOnly)) {
      setCardError('Card number must be 16 digits')
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardError('Expiry must be in MM/YY format')
      return
    }
    if (!/^\d{3}$/.test(cardCvv)) {
      setCardError('CVV must be 3 digits')
      return
    }
    const now = new Date().toISOString()
    const transactionId = `CARD-${Date.now()}`
    const paymentResult = {
      provider: 'Card',
      id: transactionId,
      status: 'COMPLETED',
      update_time: now,
      payer: { email_address: userInfo.email },
    }
    dispatch(payOrder(orderId, paymentResult))
  }
  
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    const parts = digits.match(/.{1,4}/g) || []
    return parts.join(' ')
  }
  
  const onCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value))
  }
  
  const onCardCvvChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
    setCardCvv(digits)
  }
  
  const onCardExpiryChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    let formatted = digits
    if (digits.length >= 3) {
      formatted = `${digits.slice(0,2)}/${digits.slice(2,4)}`
    }
    setCardExpiry(formatted)
  }
  
  const payByUpiHandler = (e) => {
    e.preventDefault()
    setUpiError('')
    if (!upiId || !/^[\w\.\-]{2,}@upi$/.test(upiId)) {
      setUpiError('UPI ID must be like name@upi')
      return
    }
    const now = new Date().toISOString()
    const transactionId = `UPI-${Date.now()}`
    const paymentResult = {
      provider: 'UPI',
      id: transactionId,
      status: 'COMPLETED',
      update_time: now,
      payer: { email_address: userInfo.email },
    }
    dispatch(payOrder(orderId, paymentResult))
  }
  
  return loading || !order ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <>
      <h1>Order Details</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered && (
                <Message variant="success">
                  Status: Delivered on {order.deliveredAt.substring(0, 10)}
                </Message>
              )}
              {!order.isDelivered && (
                <Alert variant="info" className="mt-3">
                  <i className="fas fa-truck mr-2"></i>
                  <strong>Tracking: </strong> 
                  Your order will be delivered within {order.paymentMethod === 'COD' ? '5-7' : '3-5'} business days.
                </Alert>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <>
                  <Message variant="success">Status: Paid on {order.paidAt}</Message>
                  {order.paymentResult && order.paymentResult.id && (
                    <Alert variant="info">
                      Transaction ID: {order.paymentResult.id}
                    </Alert>
                  )}
                </>
              ) : order.paymentMethod === 'COD' ? (
                <Message variant="info">Status: Pay on Delivery</Message>
              ) : null}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {!order.orderItems || order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x &#8377;{item.price} = &#8377;
                          {item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>&#8377;{order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>&#8377;{order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              {/* <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>{order.taxPrice}</Col>
                </Row>
              </ListGroup.Item> */}
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>&#8377;{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              
              
              {!order.isPaid && order.paymentMethod === 'Card' && Number(userInfo._id) === Number(order.user._id) && (
                <ListGroup.Item>
                  {cardError && <Message variant="danger">{cardError}</Message>}
                  <Form onSubmit={payByCardHandler}>
                    <Form.Group controlId="cardName">
                      <Form.Label>Cardholder Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                      />
                    </Form.Group>
                    <Form.Group controlId="cardNumber">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardNumber}
                        onChange={onCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group controlId="cardExpiry">
                          <Form.Label>Expiry (MM/YY)</Form.Label>
                          <Form.Control
                            type="text"
                            value={cardExpiry}
                            onChange={onCardExpiryChange}
                            placeholder="MM/YY"
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group controlId="cardCvv">
                          <Form.Label>CVV</Form.Label>
                          <Form.Control
                            type="password"
                            value={cardCvv}
                            onChange={onCardCvvChange}
                            placeholder="***"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary">Pay Now</Button>
                  </Form>
                </ListGroup.Item>
              )}
              
              {!order.isPaid && order.paymentMethod === 'UPI' && Number(userInfo._id) === Number(order.user._id) && (
                <ListGroup.Item>
                  {upiError && <Message variant="danger">{upiError}</Message>}
                  <Form onSubmit={payByUpiHandler}>
                    <Form.Group controlId="upiId">
                      <Form.Label>UPI ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g., name@upi"
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary">Pay Now</Button>
                  </Form>
                </ListGroup.Item>
              )}
              {!order.isPaid && order.paymentMethod === 'COD' && (
                <ListGroup.Item>
                  <Message variant="info">
                    <strong>Cash on Delivery</strong> - Pay when you receive your order
                  </Message>
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                (userInfo.isAdmin || userInfo.isAdminSeller) &&
                (order.isPaid || order.paymentMethod === 'COD') &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type="button"
                      className="btn btn-block"
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
              
              {(order.isPaid || order.paymentMethod === 'COD') && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn btn-block"
                    onClick={() => {
                      const win = window.open('', 'PRINT', 'height=900,width=800')
                      const itemsHtml = (order.orderItems || []).map(i => `
                        <tr>
                          <td>${i.name}</td>
                          <td>${i.qty}</td>
                          <td>₹${i.price}</td>
                          <td>₹${(i.qty * i.price).toFixed(2)}</td>
                        </tr>
                      `).join('')
                      win.document.write(`
                        <html>
                          <head>
                            <title>Receipt #${order._id}</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 24px; color: #333; }
                              .header { display:flex; justify-content:space-between; align-items:center; }
                              .brand { font-size: 20px; font-weight: 700; color:#a52a2a; }
                              .meta { margin-top: 8px; }
                              .section { margin-top: 20px; }
                              table { width:100%; border-collapse:collapse; }
                              th, td { border:1px solid #ddd; padding:8px; text-align:left; }
                              th { background:#f5f5f5; }
                              .totals { margin-top: 12px; }
                              .badge { display:inline-block; padding:4px 8px; background:#eee; border-radius:4px; }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <div class="brand">Handmade Haven</div>
                              <div class="badge">Receipt</div>
                            </div>
                            <div class="meta">
                              <div><strong>Order ID:</strong> #${order._id}</div>
                              <div><strong>Date:</strong> ${order.createdAt.substring(0, 10)}</div>
                              <div><strong>Payment Method:</strong> ${order.paymentMethod}</div>
                              <div><strong>Payment Status:</strong> ${order.isPaid ? 'Paid on ' + order.paidAt.substring(0, 10) : 'Pending (COD)'}</div>
                              ${order.paymentResult?.id ? `<div><strong>Transaction ID:</strong> ${order.paymentResult.id}</div>` : ''}
                            </div>
                            <div class="section">
                              <div><strong>Customer:</strong> ${order.user?.name || ''} (${order.user?.email || ''})</div>
                              <div><strong>Shipping:</strong> ${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''} ${order.shippingAddress?.postalCode || ''}, ${order.shippingAddress?.country || ''}</div>
                            </div>
                            <div class="section">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${itemsHtml}
                                </tbody>
                              </table>
                              <div class="totals">
                                <div><strong>Items Total:</strong> ₹${order.itemsPrice}</div>
                                <div><strong>Shipping:</strong> ₹${order.shippingPrice}</div>
                                <div><strong>Grand Total:</strong> ₹${order.totalPrice}</div>
                              </div>
                            </div>
                            <div class="section">
                              <em>Thank you for shopping at Handmade Haven!</em>
                            </div>
                          </body>
                        </html>
                      `)
                      win.document.close()
                      win.focus()
                      win.print()
                      win.close()
                    }}
                  >
                    Download Receipt
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
