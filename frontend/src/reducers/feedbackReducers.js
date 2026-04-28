import {
  FEEDBACK_LIST_REQUEST,
  FEEDBACK_LIST_SUCCESS,
  FEEDBACK_LIST_FAIL,
  FEEDBACK_DELETE_REQUEST,
  FEEDBACK_DELETE_SUCCESS,
  FEEDBACK_DELETE_FAIL,
} from '../constants/feedbackConstants'

export const feedbackListReducer = (state = { feedbacks: [] }, action) => {
  switch (action.type) {
    case FEEDBACK_LIST_REQUEST:
      return { loading: true }
    case FEEDBACK_LIST_SUCCESS:
      return { loading: false, feedbacks: action.payload }
    case FEEDBACK_LIST_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}

export const feedbackDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case FEEDBACK_DELETE_REQUEST:
      return { loading: true }
    case FEEDBACK_DELETE_SUCCESS:
      return { loading: true, success: true }
    case FEEDBACK_DELETE_FAIL:
      return { loading: false, error: action.payload }
    default:
      return state
  }
}
