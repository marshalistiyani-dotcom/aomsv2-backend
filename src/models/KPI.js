import mongoose from 'mongoose'

const kpiSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  target: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  dailyTarget: { type: Number, default: 0 },
  unit: { type: String, default: '' },
  department: { type: String, default: '' },
  period: { type: String, default: 'monthly' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

kpiSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
kpiSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('KPI', kpiSchema)
