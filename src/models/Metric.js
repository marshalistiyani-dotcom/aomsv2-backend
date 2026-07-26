import mongoose from 'mongoose'

const metricSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  platform: { type: String, required: true },
  name: { type: String, required: true },
  unit: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

metricSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
metricSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('Metric', metricSchema)
