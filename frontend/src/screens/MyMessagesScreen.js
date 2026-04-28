import React, { useEffect, useState } from 'react'
import { Table, Container, Badge, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Message from '../components/Message'
import Loader from '../components/Loader'

const MyMessagesScreen = ({ history }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else {
      const fetchMyMessages = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
          const { data } = await axios.get('/api/feedback/my', config)
          setMessages(data)
        } catch (err) {
          setError(err.response?.data?.message || err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchMyMessages()
    }
  }, [history, userInfo])

  return (
    <Container>
      <h1>My Messages & Inquiries</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : messages.length === 0 ? (
        <Message>You haven't sent any messages yet.</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>DATE</th>
              <th>TO</th>
              <th>SUBJECT</th>
              <th>MESSAGE</th>
              <th>STATUS</th>
              <th>REPLY</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.createdAt.substring(0, 10)}</td>
                <td>{msg.type === 'ADMIN' ? 'Admin' : 'Seller'}</td>
                <td>{msg.subject}</td>
                <td>{msg.message}</td>
                <td>
                  {msg.reply ? (
                    <Badge variant="success">Replied</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </td>
                <td>{msg.reply || 'Waiting for response...'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  )
}

export default MyMessagesScreen
