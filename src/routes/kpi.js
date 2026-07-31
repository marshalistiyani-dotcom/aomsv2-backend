import { Router } from 'express'
import KPI from '../models/KPI.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const list = await KPI.find().sort({ createdAt: -1 })
  res.json(list)
})

router.get('/:id', async (req, res) => {
  const item = await KPI.findOne({ id: req.params.id })
  if (!item) return res.status(404).json({ error: 'KPI not found' })
  res.json(item)
})

router.post('/', async (req, res) => {
  const { name, description, target, current, dailyTarget, unit, department, period } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const item = await KPI.create({
    id: generateId(),
    name,
    description: description || '',
    target: target || 0,
    current: current || 0,
    dailyTarget: dailyTarget || 0,
    unit: unit || '',
    department: department || '',
    period: period || 'monthly',
  })
  res.status(201).json(item.toObject())
})

router.put('/:id', async (req, res) => {
  const item = await KPI.findOne({ id: req.params.id })
  if (!item) return res.status(404).json({ error: 'KPI not found' })
  const allowed = ['name', 'description', 'target', 'current', 'dailyTarget', 'unit', 'department', 'period']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      item[key] = req.body[key]
    }
  }
  item.updatedAt = new Date().toISOString()
  await item.save()
  res.json(item.toObject())
})

router.delete('/:id', async (req, res) => {
  await KPI.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
