import {
  PAYMENT_LIST_REQUEST,
  PAYMENT_LIST_SUCCESS,
  PAYMENT_LIST_FAIL,
} from '../constants/paymentConstants'

export const paymentListReducer = (state = { payments: [] }, action) => {
  switch (action.type) {
    case PAYMENT_LIST_REQUEST:
      return { loading: true }
    case PAYMENT_LIST_SUCCESS:
      return { loading: false, payments: action.payload }
    case PAYMENT_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}
