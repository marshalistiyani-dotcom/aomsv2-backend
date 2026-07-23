import { Router } from 'express'
import Report from '../models/Report.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const list = await Report.find().sort({ createdAt: -1 })
  const mapped = list.map((r) => {
    const obj = r.toObject()
    obj.taskIds = JSON.parse(obj.taskIds || '[]')
    return obj
  })
  res.json(mapped)
})

router.get('/range', async (req, res) => {
  const { start, end } = req.query
  if (!start || !end) return res.status(400).json({ error: 'start and end date required' })
  const list = await Report.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 })
  const mapped = list.map((r) => {
    const obj = r.toObject()
    obj.taskIds = JSON.parse(obj.taskIds || '[]')
    return obj
  })
  res.json(mapped)
})

router.post('/', async (req, res) => {
  const { title, summary, notes, type, date, taskIds } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const report = await Report.create({
    id: generateId(),
    title,
    summary: summary || '',
    notes: notes || '',
    type: type || 'daily',
    date: date || null,
    userId: req.userId,
    taskIds: JSON.stringify(taskIds || []),
  })
  res.status(201).json({ ...report.toObject(), taskIds: taskIds || [] })
})

router.delete('/:id', async (req, res) => {
  await Report.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
