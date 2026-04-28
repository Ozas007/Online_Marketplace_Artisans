import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Container, Alert, Button } from 'react-bootstrap';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { listProducts } from '../actions/productActions';
import { getCartDetails } from '../actions/cartActions';
import Services from '../components/Services';
import About from '../components/About';

const HomeScreen = ({ match, history }) => {
  const keyword = match.params.keyword;

  const pageNumber = match.params.pageNumber || 1;

  const dispatch = useDispatch();
  
  const [recentOrder, setRecentOrder] = useState(null);
  const [showOrderNotification, setShowOrderNotification] = useState(false);

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(listProducts(keyword, pageNumber));
    if (userInfo) {
      dispatch(getCartDetails());
    }
    
    // Check for recent order notification
    const orderData = localStorage.getItem('recentOrder');
    if (orderData) {
      const order = JSON.parse(orderData);
      // Show notification if order was placed within last 60 seconds
      if (Date.now() - order.timestamp < 60000) {
        setRecentOrder(order);
        setShowOrderNotification(true);
        // Auto-hide after 12 seconds
        setTimeout(() => {
          setShowOrderNotification(false);
          localStorage.removeItem('recentOrder');
        }, 12000);
      } else {
        localStorage.removeItem('recentOrder');
      }
    }
  }, [dispatch, keyword, pageNumber, userInfo]);

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }, [pageNumber])
  return (
    <>
      <section className="products-slider section">
        <Meta />
        {!keyword ? (
          <ProductCarousel />
        ) : (
          <Container>
            <Link to="/" className="btn btn-light">
              Go Back
            </Link>
          </Container>
        )}
      </section>

      <div className="section popular-products">
        <Container>
          <h1>Popular Products</h1>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
              <>
              <Row>
                {products && Array.isArray(products) && products
                  .map((product) => (
                  <Col
                    className="product_cards_container"
                    key={product._id}
                    xs={6}
                    md={4}
                    lg={4}
                    xl={3}
                  >
                    <Product product={product} />
                  </Col>
                ))}
              </Row>
              <Paginate
                pages={pages}
                page={page}
                keyword={keyword ? keyword : ''}
              />
            </>
          )}
        </Container>
      </div>

      <Services />
      <About />
      
      {/* Order Success Notification */}
      {showOrderNotification && recentOrder && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1050,
          minWidth: '350px',
          maxWidth: '90%'
        }}>
          <Alert variant="success" onClose={() => {
            setShowOrderNotification(false);
            localStorage.removeItem('recentOrder');
          }} dismissible>
            <Alert.Heading>🎉 Order Placed Successfully!</Alert.Heading>
            <p>Your order has been confirmed. Total: ₹{recentOrder.total}</p>
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <Link to={`/order/${recentOrder.id}`}>
                <Button variant="outline-success" size="sm">
                  View Order Details
                </Button>
              </Link>
              <small className="text-muted">Auto-closes in a few seconds</small>
            </div>
          </Alert>
        </div>
      )}
    </>
  );
};

export default HomeScreen;
