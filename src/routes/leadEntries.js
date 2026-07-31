import { Router } from 'express'
import LeadEntry from '../models/LeadEntry.js'
import KPI from '../models/KPI.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

function getPeriodStart(period, now = new Date()) {
  if (period === 'yearly') return `${now.getFullYear()}-01-01`
  if (period === 'quarterly') {
    const q = Math.floor(now.getMonth() / 3)
    return `${now.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

async function syncKpiCurrent(kpiId) {
  const kpi = await KPI.findOne({ id: kpiId })
  if (!kpi || !kpi.dailyTarget) return
  const periodStart = getPeriodStart(kpi.period)
  const entries = await LeadEntry.find({ kpiId, date: { $gte: periodStart } })
  const total = entries.reduce((sum, e) => sum + (Number(e.actual) || 0), 0)
  kpi.current = total
  kpi.updatedAt = new Date().toISOString()
  await kpi.save()
}

router.get('/', async (req, res) => {
  const { kpiId, userId, date, startDate, endDate } = req.query
  const filter = {}
  if (kpiId) filter.kpiId = kpiId
  if (userId) filter.userId = userId
  if (date) filter.date = date
  if (startDate && endDate) filter.date = { $gte: startDate, $lte: endDate }
  const list = await LeadEntry.find(filter).sort({ date: -1, createdAt: -1 })
  res.json(list)
})

router.get('/summary', async (req, res) => {
  const { kpiId, period } = req.query
  if (!kpiId || !period || !/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: 'kpiId and period (YYYY-MM) required' })
  }
  const [year, month] = period.split('-')
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${period}-01`
  const endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`

  const kpi = await KPI.findOne({ id: kpiId })
  if (!kpi) return res.status(404).json({ error: 'KPI not found' })

  const entries = await LeadEntry.find({ kpiId, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 })
  const byUser = {}
  let totalActual = 0
  let totalTarget = 0
  for (const entry of entries) {
    totalActual += Number(entry.actual) || 0
    totalTarget += Number(entry.target) || 0
    if (!byUser[entry.userId]) byUser[entry.userId] = { totalActual: 0, totalTarget: 0, count: 0 }
    byUser[entry.userId].totalActual += Number(entry.actual) || 0
    byUser[entry.userId].totalTarget += Number(entry.target) || 0
    byUser[entry.userId].count += 1
  }

  res.json({
    kpi: { id: kpi.id, name: kpi.name, target: kpi.target, unit: kpi.unit, dailyTarget: kpi.dailyTarget },
    period,
    totalActual,
    totalTarget,
    daysCount: entries.length,
    remaining: Math.max(kpi.target - kpi.current, 0),
    byUser,
  })
})

router.post('/', async (req, res) => {
  const { date, kpiId, userId, target, actual } = req.body
  if (!date || !kpiId || !userId) {
    return res.status(400).json({ error: 'Date, kpiId, and userId required' })
  }

  const kpi = await KPI.findOne({ id: kpiId })
  if (!kpi) return res.status(404).json({ error: 'KPI not found' })

  const entryTarget = target !== undefined && target !== null ? Number(target) : (kpi.dailyTarget || 0)
  const entryActual = actual !== undefined && actual !== null ? Number(actual) : 0

  const existing = await LeadEntry.findOne({ date, kpiId, userId })
  let entry
  if (existing) {
    existing.target = entryTarget
    existing.actual = entryActual
    existing.updatedAt = new Date().toISOString()
    entry = await existing.save()
  } else {
    entry = await LeadEntry.create({
      id: generateId(),
      date,
      kpiId,
      userId,
      target: entryTarget,
      actual: entryActual,
    })
  }

  await syncKpiCurrent(kpiId)
  res.status(existing ? 200 : 201).json(entry.toObject())
})

router.delete('/:id', async (req, res) => {
  const entry = await LeadEntry.findOne({ id: req.params.id })
  if (!entry) return res.status(404).json({ error: 'Entry not found' })
  await LeadEntry.deleteOne({ id: req.params.id })
  await syncKpiCurrent(entry.kpiId)
  res.json({ success: true })
})

export default router
