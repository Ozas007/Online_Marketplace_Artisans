import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_CLEAR_ITEMS,
  CART_SET_ITEMS,
  CART_UPDATE_ITEM_STOCK,
  CART_UPDATE_ITEM_QTY,
} from '../constants/cartConstants'

export const cartReducer = (
  state = { cartItems: [], shippingAddress: {} },
  action
) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      const item = action.payload

      const existItem = state.cartItems.find((x) => x.product === item.product)

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.product === existItem.product 
              ? { ...item, qty: x.qty + item.qty } 
              : x
          ),
        }
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        }
      }
    case CART_UPDATE_ITEM_QTY:
      return {
        ...state,
        cartItems: state.cartItems.map((x) =>
          x.product === action.payload.product ? action.payload : x
        ),
      }
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      }
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      }
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      }
    case CART_CLEAR_ITEMS:
      return {
        ...state,
        cartItems: [],
      }
    case CART_SET_ITEMS:
      return {
        ...state,
        cartItems: action.payload,
      }
    case CART_UPDATE_ITEM_STOCK:
      return {
        ...state,
        cartItems: state.cartItems.map((x) =>
          x.product === action.payload.productId
            ? { ...x, countInStock: action.payload.countInStock, isSoldOut: action.payload.countInStock === 0 }
            : x
        ),
      }
    default:
      return state
  }
}