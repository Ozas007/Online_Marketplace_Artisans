import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import SearchBox from './SearchBox';
import { logout } from '../actions/userActions';
import { getCartDetails } from '../actions/cartActions';
import logo from '../assets/images/logo.png';

const Header = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  useEffect(() => {
    if (userInfo) {
      dispatch(getCartDetails());
    }
  }, [dispatch, userInfo]);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar className="nav-bar" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                alt="Handmade Haven"
                src={logo}
                width="64"
                height="64"
                className="d-inline-block align-middle"
              />
              &nbsp;&nbsp; Handmade Haven
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle
            className="nav-toggle"
            color="white"
            aria-controls="basic-navbar-nav"
          />
          <Navbar.Collapse className="flex-gap" id="basic-navbar-nav">
            <Route render={({ history }) => <SearchBox history={history} />} />
            <Nav className="ml-auto">
              <LinkContainer to="/">
                <Nav.Link>
                  <i className="fas fa-home"></i> Home
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/blog">
                <Nav.Link>
                  <i className="fas fa-blog"></i> Blog
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/contact">
                <Nav.Link>
                  <i className="fas fa-envelope"></i> Contact
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/cart">
                <Nav.Link>
                  <div className="cart-icon-container">
                    <i className="fas fa-shopping-cart"></i> Cart
                    {cartItems.filter(item => !item.isSoldOut).length > 0 && (
                      <Badge pill variant="danger" className="cart-badge">
                        {cartItems
                          .filter(item => !item.isSoldOut)
                          .reduce((acc, item) => acc + item.qty, 0)}
                      </Badge>
                    )}
                  </div>
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/mymessages">
                    <NavDropdown.Item>My Messages</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user"></i> Sign In
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/admin/userlist">
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/paymentlist">
                    <NavDropdown.Item>Payments</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/feedbacklist">
                    <NavDropdown.Item>Messages</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              {userInfo && userInfo.isAdminSeller && (
                <NavDropdown title="Seller" id="adminmenu">
                  <LinkContainer to="/admin/productlist">
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orderlist">
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
