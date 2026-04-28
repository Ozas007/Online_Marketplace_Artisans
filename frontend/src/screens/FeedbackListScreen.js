import React, { useEffect, useState } from 'react'
import { Table, Button, Container, Form, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { listFeedbacks, deleteFeedback } from '../actions/feedbackActions'

const FeedbackListScreen = ({ history }) => {
  const dispatch = useDispatch()

  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')

  const feedbackList = useSelector((state) => state.feedbackList)
  const { loading, error, feedbacks } = feedbackList

  const feedbackDelete = useSelector((state) => state.feedbackDelete)
  const { success: successDelete } = feedbackDelete

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listFeedbacks())
    } else {
      history.push('/login')
    }
  }, [dispatch, history, userInfo, successDelete])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      dispatch(deleteFeedback(id))
    }
  }

  const handleReplyClick = (feedback) => {
    setSelectedFeedback(feedback)
    setReplyText(feedback.reply || '')
    setShowReplyModal(true)
  }

  const submitReplyHandler = async (e) => {
    e.preventDefault()
    setReplyLoading(true)
    setReplyError('')

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      await axios.put(`/api/feedback/${selectedFeedback.id}/reply`, { reply: replyText }, config)
      setShowReplyModal(false)
      dispatch(listFeedbacks())
    } catch (err) {
      setReplyError(err.response?.data?.message || err.message)
    } finally {
      setReplyLoading(false)
    }
  }

  return (
    <Container>
      <h1>User Messages & Inquiries</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !feedbacks || feedbacks.length === 0 ? (
        <Message>No messages found.</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>SUBJECT</th>
                <th>MESSAGE</th>
                <th>REPLY</th>
                <th>DATE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td>{feedback.id}</td>
                  <td>{feedback.name}</td>
                  <td>{feedback.email}</td>
                  <td>{feedback.subject}</td>
                  <td>{feedback.message}</td>
                  <td>{feedback.reply ? <span className="text-success">Replied</span> : <span className="text-warning">Pending</span>}</td>
                  <td>{feedback.createdAt.substring(0, 10)}</td>
                  <td>
                    <Button
                      variant="light"
                      className="btn-sm mr-2"
                      onClick={() => handleReplyClick(feedback)}
                    >
                      <i className="fas fa-reply"></i>
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(feedback.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#a52a2a', color: 'white' }}>
              <Modal.Title>Reply to {selectedFeedback?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '2rem' }}>
              <div className="message-history mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #a52a2a' }}>
                <div className="d-flex justify-content-between mb-2">
                  <h6 className="mb-0"><strong>User Message</strong></h6>
                  <small className="text-muted">{selectedFeedback?.createdAt.substring(0, 10)}</small>
                </div>
                <p className="mb-1 text-muted"><strong>Subject:</strong> {selectedFeedback?.subject}</p>
                <hr />
                <p className="mb-0" style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>"{selectedFeedback?.message}"</p>
              </div>

              {replyError && <Message variant="danger">{replyError}</Message>}
              
              <Form onSubmit={submitReplyHandler}>
                <Form.Group controlId="reply">
                  <Form.Label className="font-weight-bold">Your Response</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    style={{ border: '1px solid #ced4da', borderRadius: '8px' }}
                  ></Form.Control>
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button variant="secondary" className="mr-2" onClick={() => setShowReplyModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="danger" 
                    disabled={replyLoading}
                    style={{ padding: '0.5rem 2rem' }}
                  >
                    {replyLoading ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </>
      )}
    </Container>
  )
}

export default FeedbackListScreen
