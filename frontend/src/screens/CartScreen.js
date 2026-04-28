import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  ListGroup,
  Image,
  Form,
  Button,
  Card,
  Container,
  Badge,
} from 'react-bootstrap';
import Message from '../components/Message';
import { addToCart, removeFromCart, getCartDetails, checkCartStock, updateCartQty } from '../actions/cartActions';

const CartScreen = ({ match, location, history }) => {
  const productId = match.params.id;
  const qty = location.search ? Number(location.search.split('=')[1]) : 1;

  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo) {
      dispatch(getCartDetails());
    }
    dispatch(checkCartStock());
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty, userInfo]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    if (userInfo) {
      history.push('/shipping');
    } else {
      history.push('/login?redirect=shipping');
    }
  };

  return (
    <Container className="cart-container py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0">Shopping Cart</h1>
        </Col>
        <Col className="text-right">
          <Link to="/">
            <Button variant="outline-primary" className="add-more-btn">
              <i className="fas fa-plus mr-2"></i> Add More Products
            </Button>
          </Link>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {cartItems.length === 0 ? (
            <Message variant="info">
              Your cart is empty <Link to="/" className="font-weight-bold ml-2">Go Back</Link>
            </Message>
          ) : (
            <Card className="cart-items-card shadow-sm border-0">
              <ListGroup variant="flush">
                {cartItems.map((item) => (
                  <ListGroup.Item
                    key={item.product}
                    className="py-4 px-4 cart-item"
                    style={{
                      opacity: item.isSoldOut ? 0.6 : 1,
                      backgroundColor: item.isSoldOut ? '#fff5f5' : 'transparent'
                    }}
                  >
                    <Row className="align-items-center">
                      <Col md={2} sm={3} className="mb-3 mb-md-0 text-center">
                        <Image src={item.image} alt={item.name} fluid rounded className="cart-item-image shadow-sm" />
                      </Col>
                      <Col md={3} sm={9} className="mb-3 mb-md-0">
                        <Link to={`/product/${item.product}`} className="cart-item-name font-weight-bold text-dark h5">
                          {item.name}
                        </Link>
                        {item.isSoldOut && (
                          <div className="mt-1">
                            <Badge variant="danger">Sold Out</Badge>
                          </div>
                        )}
                      </Col>
                      <Col md={2} sm={4} className="text-md-center font-weight-bold text-primary">
                        &#8377;{item.price.toLocaleString()}
                      </Col>
                      <Col md={3} sm={4} className="text-center">
                        {item.isSoldOut ? (
                          <span className="text-danger small font-weight-bold">Unavailable</span>
                        ) : (
                          <div className="qty-selector-container mx-auto" style={{ maxWidth: '100px' }}>
                            <Form.Control
                              as="select"
                              value={item.qty}
                              className="qty-select custom-select shadow-sm"
                              onChange={(e) =>
                                dispatch(
                                  updateCartQty(item.product, Number(e.target.value))
                                )
                              }
                            >
                              {[...Array(item.countInStock).keys()].map((x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              ))}
                            </Form.Control>
                          </div>
                        )}
                      </Col>
                      <Col md={2} sm={4} className="text-right text-md-center">
                        <Button
                          type="button"
                          variant="light"
                          className="remove-btn text-danger shadow-sm border"
                          onClick={() => removeFromCartHandler(item.product)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                    {item.isSoldOut && item.countInStock === 0 && (
                      <Row className="mt-3">
                        <Col>
                          <Message variant="warning" className="mb-0 small py-2">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            This item is out of stock. Please remove it to proceed.
                          </Message>
                        </Col>
                      </Row>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col lg={4} className="mt-4 mt-lg-0">
          <Card className="summary-card shadow border-0 overflow-hidden">
            <div className="summary-header bg-light p-3 border-bottom">
              <h3 className="h5 mb-0 font-weight-bold text-center">Order Summary</h3>
            </div>
            <ListGroup variant="flush">
              <ListGroup.Item className="py-4 px-4 bg-transparent border-0">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal ({cartItems.filter(item => !item.isSoldOut).reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="font-weight-bold">
                    &#8377;{cartItems
                      .filter(item => !item.isSoldOut)
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 text-success">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 font-weight-bold mb-0">Total</span>
                  <span className="h4 font-weight-bold text-primary mb-0">
                    &#8377;{cartItems
                      .filter(item => !item.isSoldOut)
                      .reduce((acc, item) => acc + item.qty * item.price, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="bg-light p-4 border-0">
                <Button
                  type="button"
                  className="btn-block py-3 font-weight-bold shadow-sm"
                  variant="primary"
                  disabled={cartItems.length === 0 || cartItems.every(item => item.isSoldOut)}
                  onClick={checkoutHandler}
                >
                  Proceed To Checkout <i className="fas fa-chevron-right ml-2"></i>
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartScreen;