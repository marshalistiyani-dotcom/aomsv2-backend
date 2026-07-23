import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password required' })
  }
  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' })
  }
  const match = bcrypt.compareSync(password, user.password)
  if (!match) {
    return res.status(401).json({ error: 'Email atau password salah' })
  }
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, createdAt: user.createdAt }
  const token = generateToken(safe)
  res.json({ token, user: safe })
})

router.post('/register', async (req, res) => {
  const { name, email, password, role, department } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, password required' })
  }
  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar' })
  }
  const hashed = bcrypt.hashSync(password, 10)
  const user = await User.create({
    id: generateId(),
    name, email, password: hashed,
    role: role || 'staff',
    department: department || '',
  })
  const safe = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, createdAt: user.createdAt }
  const token = generateToken(safe)
  res.status(201).json({ token, user: safe })
})

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findOne({ id: req.userId }, { password: 0 })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, createdAt: user.createdAt } })
})

export default router
