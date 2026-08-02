import { Router } from 'express'
import Report from '../models/Report.js'
import KPI from '../models/KPI.js'
import Event from '../models/Event.js'
import DailyMetric from '../models/DailyMetric.js'
import Metric from '../models/Metric.js'
import DailySheet from '../models/DailySheet.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

function parseReport(doc) {
  const obj = doc.toObject()
  obj.taskIds = JSON.parse(obj.taskIds || '[]')
  obj.taskSummary = JSON.parse(obj.taskSummary || '{}')
  obj.kpiProgress = JSON.parse(obj.kpiProgress || '[]')
  obj.eventReports = JSON.parse(obj.eventReports || '[]')
  obj.metrics = JSON.parse(obj.metrics || '{}')
  obj.leadSummary = JSON.parse(obj.leadSummary || '{}')
  return obj
}

router.get('/', async (req, res) => {
  const list = await Report.find().sort({ createdAt: -1 })
  res.json(list.map(parseReport))
})

router.get('/range', async (req, res) => {
  const { start, end } = req.query
  if (!start || !end) return res.status(400).json({ error: 'start and end date required' })
  const list = await Report.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 })
  res.json(list.map(parseReport))
})

router.get('/:id', async (req, res) => {
  const report = await Report.findOne({ id: req.params.id })
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json(parseReport(report))
})

router.post('/', async (req, res) => {
  const { title, summary, notes, type, date, period, taskIds, taskSummary, kpiProgress, eventReports, metrics, leadSummary } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })
  const report = await Report.create({
    id: generateId(),
    title,
    summary: summary || '',
    notes: notes || '',
    type: type || 'daily',
    date: date || null,
    period: period || null,
    userId: req.userId,
    taskIds: JSON.stringify(taskIds || []),
    taskSummary: JSON.stringify(taskSummary || {}),
    kpiProgress: JSON.stringify(kpiProgress || []),
    eventReports: JSON.stringify(eventReports || []),
    metrics: JSON.stringify(metrics || {}),
    leadSummary: JSON.stringify(leadSummary || {}),
  })
  res.status(201).json(parseReport(report))
})

router.put('/:id', async (req, res) => {
  const report = await Report.findOne({ id: req.params.id })
  if (!report) return res.status(404).json({ error: 'Report not found' })
  const allowed = ['title', 'summary', 'notes', 'type', 'date', 'period', 'taskIds', 'taskSummary', 'kpiProgress', 'eventReports', 'metrics', 'leadSummary']
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === 'taskIds' || key === 'taskSummary' || key === 'kpiProgress' || key === 'eventReports' || key === 'metrics' || key === 'leadSummary') {
        report[key] = JSON.stringify(req.body[key])
      } else {
        report[key] = req.body[key]
      }
    }
  }
  await report.save()
  res.json(parseReport(report))
})

router.delete('/:id', async (req, res) => {
  await Report.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

router.post('/monthly', async (req, res) => {
  const { period, notes } = req.body
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: 'Period required (YYYY-MM)' })
  }
  const [year, month] = period.split('-')
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${period}-01`
  const endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`

  const sheets = await DailySheet.find({ date: { $gte: startDate, $lte: endDate } })
  const taskSummary = {
    total: sheets.length,
    completed: sheets.filter(s => s.status === 'reported').length,
    inProgress: sheets.filter(s => s.status !== 'reported').length,
    undone: 0,
  }

  const kpiList = await KPI.find()
  const kpiProgress = kpiList.map(k => ({
    kpiId: k.id,
    name: k.name,
    target: k.target,
    current: k.current,
    unit: k.unit,
    percentage: k.target > 0 ? Math.round((k.current / k.target) * 100) : 0,
  }))

  const events = await Event.find({ status: 'completed' })
  const eventReports = events.filter(e => e.report && e.report.createdAt).map(e => ({
    eventId: e.id,
    title: e.title,
    date: e.date,
    totalParticipants: e.report.totalParticipants,
    notes: e.report.notes,
  }))

  const dailyMetrics = await DailyMetric.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 })
  const metricDefs = await Metric.find()
  const metricMap = {}
  metricDefs.forEach(m => { metricMap[m.id] = m })

  const metrics = {}
  for (const entry of dailyMetrics) {
    const p = entry.platform
    if (!metrics[p]) metrics[p] = {}
    const values = JSON.parse(entry.values || '[]')
    for (const v of values) {
      const meta = metricMap[v.metricId]
      if (!meta) continue
      if (!metrics[p][v.metricId]) {
        metrics[p][v.metricId] = { name: meta.name, unit: meta.unit, total: 0, count: 0 }
      }
      metrics[p][v.metricId].total += Number(v.value) || 0
      metrics[p][v.metricId].count += 1
    }
  }
  for (const p of Object.keys(metrics)) {
    for (const mId of Object.keys(metrics[p])) {
      const d = metrics[p][mId]
      metrics[p][mId].average = d.count > 0 ? d.total / d.count : 0
      delete metrics[p][mId].count
    }
  }

  const periodSheets = await DailySheet.find({ date: { $gte: startDate, $lte: endDate } })
  const allSheets = await DailySheet.find()
  const leadByUser = {}
  const leadSummary = {
    target: 0,
    actual: 0,
    followedUp: 0,
    allTimeTotal: 0,
    byUser: leadByUser,
  }
  for (const sheet of periodSheets) {
    const target = (sheet.items || []).reduce((s, it) => s + (Number(it.targetLeads) || 0), 0)
    const actual = (sheet.items || []).reduce((s, it) => s + (Number(it.leadsObtained) || 0), 0)
    leadSummary.target += target
    leadSummary.actual += actual
    leadSummary.followedUp += Number(sheet.followedUp) || 0
    if (!leadByUser[sheet.userId]) leadByUser[sheet.userId] = { target: 0, actual: 0, followedUp: 0 }
    leadByUser[sheet.userId].target += target
    leadByUser[sheet.userId].actual += actual
    leadByUser[sheet.userId].followedUp += Number(sheet.followedUp) || 0
  }
  for (const sheet of allSheets) {
    leadSummary.allTimeTotal += (sheet.items || []).reduce((s, it) => s + (Number(it.leadsObtained) || 0), 0)
  }

  const existing = await Report.findOne({ period, type: 'monthly' })
  if (existing) {
    existing.notes = notes || existing.notes
    existing.taskSummary = JSON.stringify(taskSummary)
    existing.kpiProgress = JSON.stringify(kpiProgress)
    existing.eventReports = JSON.stringify(eventReports)
    existing.metrics = JSON.stringify(metrics)
    existing.leadSummary = JSON.stringify(leadSummary)
    await existing.save()
    return res.json(parseReport(existing))
  }

  const report = await Report.create({
    id: generateId(),
    title: `Laporan Bulanan - ${period}`,
    type: 'monthly',
    period,
    date: endDate,
    userId: req.userId,
    notes: notes || '',
    taskSummary: JSON.stringify(taskSummary),
    kpiProgress: JSON.stringify(kpiProgress),
    eventReports: JSON.stringify(eventReports),
    metrics: JSON.stringify(metrics),
    leadSummary: JSON.stringify(leadSummary),
  })
  res.status(201).json(parseReport(report))
})

export default router
