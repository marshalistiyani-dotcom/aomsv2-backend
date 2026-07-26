import { Router } from 'express'
import Metric from '../models/Metric.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

const PLATFORMS = ['Artikel Website', 'Instagram', 'TikTok', 'YouTube']

router.get('/', async (req, res) => {
  const { platform } = req.query
  const filter = platform ? { platform } : {}
  const list = await Metric.find(filter).sort({ createdAt: -1 })
  res.json(list)
})

router.get('/platforms', (req, res) => {
  res.json(PLATFORMS)
})

router.post('/', async (req, res) => {
  const { platform, name, unit } = req.body
  if (!platform || !name) return res.status(400).json({ error: 'Platform and name required' })
  if (!PLATFORMS.includes(platform)) return res.status(400).json({ error: 'Invalid platform' })
  const metric = await Metric.create({ id: generateId(), platform, name, unit: unit || '' })
  res.status(201).json(metric.toObject())
})

router.put('/:id', async (req, res) => {
  const metric = await Metric.findOne({ id: req.params.id })
  if (!metric) return res.status(404).json({ error: 'Metric not found' })
  const { name, unit } = req.body
  if (name !== undefined) metric.name = name
  if (unit !== undefined) metric.unit = unit
  await metric.save()
  res.json(metric.toObject())
})

router.delete('/:id', async (req, res) => {
  await Metric.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
