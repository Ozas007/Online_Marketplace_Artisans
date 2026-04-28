import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Row, Col, Container, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { register } from '../actions/userActions';

const RegisterScreen = ({ location, history }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  

  const dispatch = useDispatch();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
    }
  }, [userInfo, history, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!name) {
      setMessage('Name is required');
      return;
    }
    if (!email) {
      setMessage('Email is required');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setMessage('Please enter a valid email address');
      return;
    }
    if (!password) {
      setMessage('Password is required');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(register(name, email, password));
    }
  };

  return (
    <Container>
      <FormContainer>
        <Card className="shadow-sm" border="primary">
          <Card.Body>
        <h1>Sign Up</h1>
        {message && <Message variant="danger">{message}</Message>}
        {error && <Message variant="danger">{error}</Message>}
        {loading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <OverlayTrigger placement="right" overlay={<Tooltip>Your display name</Tooltip>}>
              <Form.Control
                type="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </OverlayTrigger>
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email Address</Form.Label>
            <OverlayTrigger placement="right" overlay={<Tooltip>We’ll send confirmations here</Tooltip>}>
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

          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <OverlayTrigger placement="right" overlay={<Tooltip>Re-enter password to confirm</Tooltip>}>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></Form.Control>
            </OverlayTrigger>
          </Form.Group>

          <OverlayTrigger placement="top" overlay={<Tooltip>Create your account</Tooltip>}>
            <Button type="submit" variant="primary">
              Register
            </Button>
          </OverlayTrigger>
        </Form>

        <Row className="py-3">
          <Col>
            Have an Account?{' '}
            <OverlayTrigger placement="top" overlay={<Tooltip>Go to login</Tooltip>}>
              <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>
                Login
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

export default RegisterScreen;
