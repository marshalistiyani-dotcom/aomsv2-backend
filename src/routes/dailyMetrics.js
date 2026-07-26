import { Router } from 'express'
import DailyMetric from '../models/DailyMetric.js'
import Metric from '../models/Metric.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const { platform, startDate, endDate } = req.query
  const filter = {}
  if (platform) filter.platform = platform
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate }
  }
  const list = await DailyMetric.find(filter).sort({ date: -1, createdAt: -1 })
  const mapped = list.map((r) => {
    const obj = r.toObject()
    obj.values = JSON.parse(obj.values || '[]')
    return obj
  })
  res.json(mapped)
})

router.post('/', async (req, res) => {
  const { date, platform, values } = req.body
  if (!date || !platform) return res.status(400).json({ error: 'Date and platform required' })

  const existing = await DailyMetric.findOne({ date, platform, userId: req.userId })
  if (existing) {
    existing.values = JSON.stringify(values || [])
    await existing.save()
    const obj = existing.toObject()
    obj.values = values || []
    return res.json(obj)
  }

  const entry = await DailyMetric.create({
    id: generateId(),
    date,
    platform,
    values: JSON.stringify(values || []),
    userId: req.userId,
  })
  const obj = entry.toObject()
  obj.values = values || []
  res.status(201).json(obj)
})

router.delete('/:id', async (req, res) => {
  await DailyMetric.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

router.get('/summary', async (req, res) => {
  const { period } = req.query
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: 'Period required (YYYY-MM)' })
  }
  const [year, month] = period.split('-')
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${period}-01`
  const endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`

  const entries = await DailyMetric.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 })

  const metrics = await Metric.find()
  const metricMap = {}
  metrics.forEach(m => { metricMap[m.id] = m })

  const platforms = {}
  for (const entry of entries) {
    const p = entry.platform
    if (!platforms[p]) platforms[p] = {}
    const values = JSON.parse(entry.values || '[]')
    for (const v of values) {
      const meta = metricMap[v.metricId]
      if (!meta) continue
      if (!platforms[p][v.metricId]) {
        platforms[p][v.metricId] = { name: meta.name, unit: meta.unit, total: 0, count: 0, values: [] }
      }
      platforms[p][v.metricId].total += Number(v.value) || 0
      platforms[p][v.metricId].count += 1
      platforms[p][v.metricId].values.push({ date: entry.date, value: Number(v.value) || 0 })
    }
  }

  const result = {}
  for (const [platform, metricsData] of Object.entries(platforms)) {
    result[platform] = {}
    for (const [metricId, data] of Object.entries(metricsData)) {
      result[platform][metricId] = {
        name: data.name,
        unit: data.unit,
        total: data.total,
        average: data.count > 0 ? data.total / data.count : 0,
        count: data.count,
        values: data.values,
      }
    }
  }

  res.json(result)
})

export default router
