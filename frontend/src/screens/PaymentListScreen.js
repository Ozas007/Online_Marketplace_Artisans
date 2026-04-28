import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listPayments } from '../actions/paymentActions'

const PaymentListScreen = ({ history }) => {
  const dispatch = useDispatch()

  const paymentList = useSelector((state) => state.paymentList)
  const { loading, error, payments } = paymentList

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listPayments())
    } else {
      history.push('/login')
    }
  }, [dispatch, history, userInfo])

  return (
    <Container>
      <h1>Payments</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !payments || payments.length === 0 ? (
        <Message>No payment records found.</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>ORDER ID</th>
              <th>USER</th>
              <th>PROVIDER</th>
              <th>EXTERNAL ID</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.order_id}</td>
                <td>{payment.user_name} ({payment.user_email})</td>
                <td>{payment.provider}</td>
                <td>{payment.external_id}</td>
                <td>&#8377;{payment.amount}</td>
                <td>{payment.createdAt.substring(0, 10)}</td>
                <td>
                  <LinkContainer to={`/order/${payment.order_id}`}>
                    <Button variant="light" className="btn-sm">
                      Order Details
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}

export default PaymentListScreen
