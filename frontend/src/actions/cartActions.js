import axios from 'axios'
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_SET_ITEMS,
  CART_CLEAR_ITEMS,
  CART_UPDATE_ITEM_STOCK,
  CART_UPDATE_ITEM_QTY,
} from '../constants/cartConstants'

export const setCartItems = (items) => ({
  type: CART_SET_ITEMS,
  payload: items,
})

export const addToCart = (id, qty) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    if (userInfo) {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      const { data } = await axios.post('/api/cart', { productId: id, qty }, config)
      dispatch({
        type: CART_SET_ITEMS,
        payload: data,
      })
      localStorage.setItem('cartItems', JSON.stringify(data))
    } else {
      throw new Error('Not logged in')
    }
  } catch (error) {
    const { data } = await axios.get(`/api/products/${id}`)
    console.log(data)
    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        sellerId: data.user,
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty,
      },
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
  }
}

export const removeFromCart = (id) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    if (userInfo) {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      await axios.delete(`/api/cart/${id}`, config)
      const { data } = await axios.get('/api/cart', config)
      dispatch({
        type: CART_SET_ITEMS,
        payload: data,
      })
      localStorage.setItem('cartItems', JSON.stringify(data))
    } else {
      throw new Error('Not logged in')
    }
  } catch (error) {
    dispatch({
      type: CART_REMOVE_ITEM,
      payload: id,
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
  }
}

export const updateCartQty = (id, qty) => async (dispatch, getState) => {
  try {
    const {
      userLogin: { userInfo },
    } = getState()

    if (userInfo) {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      const { data } = await axios.put('/api/cart/' + id, { productId: id, qty }, config)
      dispatch({
        type: CART_SET_ITEMS,
        payload: data,
      })
      localStorage.setItem('cartItems', JSON.stringify(data))
    } else {
      throw new Error('Not logged in')
    }
  } catch (error) {
    const { data } = await axios.get(`/api/products/${id}`)
    dispatch({
      type: CART_UPDATE_ITEM_QTY,
      payload: {
        sellerId: data.user,
        product: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        countInStock: data.countInStock,
        qty,
      },
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
  }
}

export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  })

  localStorage.setItem('shippingAddress', JSON.stringify(data))
}

export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  })

  localStorage.setItem('paymentMethod', JSON.stringify(data))
}

export const clearCartItems = () => (dispatch) => {
  dispatch({
    type: CART_CLEAR_ITEMS,
  })
  localStorage.removeItem('cartItems')
}

export const syncCartWithDb = () => async (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState()

  if (userInfo) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      
      const localCartItems = getState().cart.cartItems || []
      
      // We only merge if there's no "synced" flag in the items
      // This prevents re-merging items already fetched from DB
      const itemsToMerge = localCartItems.filter(item => !item._id || typeof item._id === 'string' && item._id.startsWith('guest'))

      let data;
      if (itemsToMerge.length > 0) {
        const response = await axios.post('/api/cart/merge', { cartItems: itemsToMerge }, config)
        data = response.data
      } else {
        const response = await axios.get('/api/cart', config)
        data = response.data
      }

      dispatch({
        type: CART_SET_ITEMS,
        payload: data,
      })
      localStorage.setItem('cartItems', JSON.stringify(data))
    } catch (error) {
      console.log('Could not sync cart with database')
    }
  }
}

export const getCartDetails = () => async (dispatch, getState) => {
  const {
    userLogin: { userInfo },
  } = getState()

  if (userInfo) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      }
      const { data } = await axios.get('/api/cart', config)
      dispatch({
        type: CART_SET_ITEMS,
        payload: data,
      })
      localStorage.setItem('cartItems', JSON.stringify(data))
    } catch (error) {
      console.log('Could not fetch cart from database')
    }
  }
}

export const checkCartStock = () => async (dispatch, getState) => {
  const { cartItems } = getState().cart
  if (cartItems.length === 0) return

  const productIds = cartItems.map(item => item.product).join(',')
  try {
    const { data } = await axios.get(`/api/products/stock?ids=${productIds}`)
    data.forEach(stockItem => {
      dispatch({
        type: CART_UPDATE_ITEM_STOCK,
        payload: {
          productId: stockItem.productId,
          countInStock: stockItem.countInStock,
        },
      })
    })
    const updatedCart = getState().cart.cartItems.map(item => {
      const stockItem = data.find(s => s.productId === item.product)
      if (stockItem) {
        return { ...item, countInStock: stockItem.countInStock, isSoldOut: stockItem.isSoldOut }
      }
      return item
    })
    localStorage.setItem('cartItems', JSON.stringify(updatedCart))
  } catch (error) {
    console.log('Could not check stock')
  }
}