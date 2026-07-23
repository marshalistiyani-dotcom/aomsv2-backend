import { Router } from 'express'
import Task from '../models/Task.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 })
  res.json(tasks)
})

router.get('/:id', async (req, res) => {
  const task = await Task.findOne({ id: req.params.id })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

router.post('/', async (req, res) => {
  const { title, description, status, priority, progress, dueDate, timeStart, timeEnd, assignee } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const task = await Task.create({
    id: generateId(),
    title,
    description: description || '',
    status: status || 'todo',
    priority: priority || 'medium',
    progress: progress || 0,
    dueDate: dueDate || null,
    timeStart: timeStart || null,
    timeEnd: timeEnd || null,
    assignee: assignee || null,
    createdBy: req.userId,
  })
  res.status(201).json(task.toObject())
})

router.put('/:id', async (req, res) => {
  const task = await Task.findOne({ id: req.params.id })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  const allowed = ['title', 'description', 'status', 'priority', 'progress', 'dueDate', 'timeStart', 'timeEnd', 'assignee']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      task[key] = req.body[key]
    }
  }
  task.updatedAt = new Date().toISOString()
  await task.save()
  res.json(task.toObject())
})

router.delete('/:id', async (req, res) => {
  await Task.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
