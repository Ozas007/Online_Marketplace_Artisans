import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const user = await User.findByEmail(email)

  if (user && (await User.matchPassword(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      isAdminSeller: Boolean(user.isAdminSeller),
      token: generateToken(user.id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!name || !email || !password) {
    res.status(400)
    throw new Error(
      !name ? 'Name is required' : !email ? 'Email is required' : 'Password is required'
    )
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    res.status(400)
    throw new Error('Please enter a valid email address')
  }

  if (String(password).length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  const userExists = await User.findByEmail(email)

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isAdminSeller: user.isAdminSeller,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      isAdminSeller: Boolean(user.isAdminSeller),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const updatedUser = await User.update(req.user._id, {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      password: req.body.password || null,
    })

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: Boolean(updatedUser.isAdmin),
      isAdminSeller: Boolean(updatedUser.isAdminSeller),
      token: generateToken(updatedUser.id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll()
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await User.delete(req.params.id)
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByIdWithoutPassword(req.params.id)

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    const updatedUser = await User.update(req.params.id, {
      name: req.body.name || user.name,
      email: req.body.email || user.email,
      isAdmin: req.body.isAdmin,
      isAdminSeller: req.body.isAdminSeller,
    })

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: Boolean(updatedUser.isAdmin),
      isAdminSeller: Boolean(updatedUser.isAdminSeller),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get all active sellers
// @route   GET /api/users/sellers
// @access  Public
const getSellers = asyncHandler(async (req, res) => {
  const [rows] = await getPool().execute(
    'SELECT id, name, email FROM users WHERE isAdminSeller = TRUE'
  )
  res.json(rows)
})

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getSellers,
}
