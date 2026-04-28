import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { login } from '../actions/userActions';

const LoginScreen = ({ location, history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [userInfo, history, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <Container>
      <FormContainer>
        <Card className="shadow-sm" border="primary">
          <Card.Body>
        <h1>Sign In</h1>
        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="email">
            <Form.Label>Email Address</Form.Label>
            <OverlayTrigger placement="right" overlay={<Tooltip>Use your registered email</Tooltip>}>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </OverlayTrigger>
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <OverlayTrigger placement="right" overlay={<Tooltip>Minimum 6 characters</Tooltip>}>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </OverlayTrigger>
          </Form.Group>

          <OverlayTrigger placement="top" overlay={<Tooltip>Sign in to continue</Tooltip>}>
            <Button type="submit" variant="primary">
              Sign In
            </Button>
          </OverlayTrigger>
        </Form>

        <Row className="py-3">
          <Col>
            New Customer?{' '}
            <OverlayTrigger placement="top" overlay={<Tooltip>Create a new account</Tooltip>}>
              <Link
                to={redirect ? `/register?redirect=${redirect}` : '/register'}
              >
                Register
              </Link>
            </OverlayTrigger>
          </Col>
        </Row>
          </Card.Body>
        </Card>
      </FormContainer>
    </Container>
  );
};

export default LoginScreen;
