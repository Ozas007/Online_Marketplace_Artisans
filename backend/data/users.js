import bcrypt from 'bcryptjs'

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    isAdminSeller: false,
  },
  {
    name: 'Artisan Seller',
    email: 'seller@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isAdminSeller: true,
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: false,
    isAdminSeller: false,
  },
]

export default users
