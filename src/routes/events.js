import { Router } from 'express'
import Event from '../models/Event.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: -1 })
  res.json(events)
})

router.get('/:id', async (req, res) => {
  const event = await Event.findOne({ id: req.params.id })
  if (!event) return res.status(404).json({ error: 'Event not found' })
  res.json(event)
})

router.post('/', async (req, res) => {
  const { title, description, date, time, location, pic, status } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const event = await Event.create({
    id: generateId(),
    title,
    description: description || '',
    date: date || null,
    time: time || null,
    location: location || '',
    pic: pic || null,
    status: status || 'upcoming',
    createdBy: req.userId,
  })
  res.status(201).json(event.toObject())
})

router.put('/:id', async (req, res) => {
  const event = await Event.findOne({ id: req.params.id })
  if (!event) return res.status(404).json({ error: 'Event not found' })
  const allowed = ['title', 'description', 'date', 'time', 'location', 'pic', 'status']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      event[key] = req.body[key]
    }
  }
  event.updatedAt = new Date().toISOString()
  await event.save()
  res.json(event.toObject())
})

router.delete('/:id', async (req, res) => {
  await Event.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router
