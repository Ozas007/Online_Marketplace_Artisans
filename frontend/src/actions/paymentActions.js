import axios from 'axios'
import {
  PAYMENT_LIST_REQUEST,
  PAYMENT_LIST_SUCCESS,
  PAYMENT_LIST_FAIL,
} from '../constants/paymentConstants'
import { logout } from './userActions'

export const listPayments = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: PAYMENT_LIST_REQUEST,
    })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    const { data } = await axios.get(`/api/payments`, config)

    dispatch({
      type: PAYMENT_LIST_SUCCESS,
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
      type: PAYMENT_LIST_FAIL,
      payload: message,
    })
  }
}
