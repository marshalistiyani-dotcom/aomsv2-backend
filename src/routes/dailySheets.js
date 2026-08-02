import { Router } from 'express'
import DailySheet from '../models/DailySheet.js'
import Report from '../models/Report.js'
import { authenticate } from '../middleware/auth.js'
import { generateId } from '../utils.js'

const router = Router()
router.use(authenticate)

router.get('/', async (req, res) => {
  const { date, userId } = req.query
  const filter = {}
  if (date) filter.date = date
  if (userId) filter.userId = userId
  const list = await DailySheet.find(filter).sort({ date: -1, createdAt: -1 })
  res.json(list)
})

router.get('/:id', async (req, res) => {
  const sheet = await DailySheet.findOne({ id: req.params.id })
  if (!sheet) return res.status(404).json({ error: 'Lembar tidak ditemukan' })
  res.json(sheet)
})

router.post('/', async (req, res) => {
  const { date, userId, items } = req.body
  if (!date || !userId) {
    return res.status(400).json({ error: 'Tanggal dan nama tim wajib diisi' })
  }
  const sheet = await DailySheet.create({
    id: generateId(),
    date,
    userId,
    createdBy: req.userId,
    items: items || [],
  })
  res.status(201).json(sheet)
})

router.put('/:id', async (req, res) => {
  const sheet = await DailySheet.findOne({ id: req.params.id })
  if (!sheet) return res.status(404).json({ error: 'Lembar tidak ditemukan' })
  const allowed = ['date', 'userId', 'items', 'notes', 'followedUp', 'status']
  for (const key of allowed) {
    if (req.body[key] !== undefined) sheet[key] = req.body[key]
  }
  sheet.updatedAt = new Date().toISOString()
  await sheet.save()
  res.json(sheet)
})

router.delete('/:id', async (req, res) => {
  const sheet = await DailySheet.findOne({ id: req.params.id })
  if (!sheet) return res.status(404).json({ error: 'Lembar tidak ditemukan' })
  await DailySheet.deleteOne({ id: req.params.id })
  await Report.deleteMany({ sheetId: req.params.id })
  res.json({ success: true })
})

router.post('/:id/submit', async (req, res) => {
  const sheet = await DailySheet.findOne({ id: req.params.id })
  if (!sheet) return res.status(404).json({ error: 'Lembar tidak ditemukan' })

  const { items, notes, followedUp } = req.body
  sheet.items = items || sheet.items
  sheet.notes = notes !== undefined ? notes : sheet.notes
  sheet.followedUp = followedUp !== undefined && followedUp !== null ? Number(followedUp) : sheet.followedUp
  sheet.status = 'reported'
  sheet.updatedAt = new Date().toISOString()
  await sheet.save()

  const target = (sheet.items || []).reduce((s, it) => s + (Number(it.targetLeads) || 0), 0)
  const actual = (sheet.items || []).reduce((s, it) => s + (Number(it.leadsObtained) || 0), 0)

  const allSheets = await DailySheet.find()
  let allTimeTotal = 0
  for (const s of allSheets) {
    allTimeTotal += (s.items || []).reduce((sum, it) => sum + (Number(it.leadsObtained) || 0), 0)
  }

  const leadSummary = {
    allTimeTotal,
    target,
    actual,
    followedUp: sheet.followedUp,
    byUser: { [sheet.userId]: { target, actual, followedUp: sheet.followedUp } },
  }

  const existing = await Report.findOne({ sheetId: sheet.id })
  const data = {
    title: `Laporan Harian - ${sheet.date}`,
    summary: `${sheet.items?.length || 0} kegiatan, ${actual} leads didapat`,
    notes: sheet.notes || '',
    type: 'daily',
    date: sheet.date,
    userId: sheet.userId,
    taskIds: [],
    leadSummary,
  }
  if (existing) {
    for (const key of ['title', 'summary', 'notes', 'date', 'userId', 'leadSummary']) {
      existing[key] = key === 'leadSummary' ? JSON.stringify(data.leadSummary) : data[key]
    }
    await existing.save()
    return res.json({ sheet, report: existing })
  }

  const report = await Report.create({
    id: generateId(),
    sheetId: sheet.id,
    title: data.title,
    summary: data.summary,
    notes: data.notes,
    type: 'daily',
    date: data.date,
    userId: sheet.userId,
    taskIds: '[]',
    leadSummary: JSON.stringify(leadSummary),
  })
  res.status(201).json({ sheet, report })
})

export default router
