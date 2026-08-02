import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  notes: { type: String, default: '' },
  type: { type: String, default: 'daily' },
  date: { type: String },
  period: { type: String },
  sheetId: { type: String },
  userId: { type: String },
  taskIds: { type: String, default: '[]' },
  taskSummary: { type: String, default: '{}' },
  kpiProgress: { type: String, default: '[]' },
  eventReports: { type: String, default: '[]' },
  metrics: { type: String, default: '{}' },
  leadSummary: { type: String, default: '{}' },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

reportSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
reportSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('Report', reportSchema)
