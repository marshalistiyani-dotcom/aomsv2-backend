import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)
router.use(adminOnly)

router.get('/', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json(users.map((u) => { const { password, ...rest } = u.toObject(); return rest }))
})

router.get('/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id })
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...rest } = user.toObject()
  res.json(rest)
})

router.post('/', async (req, res) => {
  const { name, email, password, role, department } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' })
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email sudah terdaftar' })
  const hashed = bcrypt.hashSync(password, 10)
  const user = await User.create({
    id: generateId(), name, email,
    password: hashed,
    role: role || 'staff',
    department: department || '',
  })
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, createdAt: user.createdAt })
})

router.put('/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id })
  if (!user) return res.status(404).json({ error: 'User not found' })
  const allowed = ['name', 'email', 'role', 'department']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      user[key] = req.body[key]
    }
  }
  if (req.body.password) {
    user.password = bcrypt.hashSync(req.body.password, 10)
  }
  user.updatedAt = new Date().toISOString()
  await user.save()
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, createdAt: user.createdAt })
})

router.delete('/:id', async (req, res) => {
  await User.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
