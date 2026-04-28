import axios from 'axios'
import {
  FEEDBACK_LIST_REQUEST,
  FEEDBACK_LIST_SUCCESS,
  FEEDBACK_LIST_FAIL,
  FEEDBACK_DELETE_REQUEST,
  FEEDBACK_DELETE_SUCCESS,
  FEEDBACK_DELETE_FAIL,
} from '../constants/feedbackConstants'
import { logout } from './userActions'

export const listFeedbacks = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: FEEDBACK_LIST_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/feedback`, config)

    dispatch({
      type: FEEDBACK_LIST_SUCCESS,
      payload: data,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      dispatch(logout())
    }
    dispatch({
      type: FEEDBACK_LIST_FAIL,
      payload: message,
    })
  }
}

export const deleteFeedback = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: FEEDBACK_DELETE_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    await axios.delete(`/api/feedback/${id}`, config)

    dispatch({
      type: FEEDBACK_DELETE_SUCCESS,
    })
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    if (message === 'Not authorized, token failed') {
      dispatch(logout())
    }
    dispatch({
      type: FEEDBACK_DELETE_FAIL,
      payload: message,
    })
  }
}
