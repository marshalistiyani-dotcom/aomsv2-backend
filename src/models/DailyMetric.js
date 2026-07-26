import mongoose from 'mongoose'

const dailyMetricSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  date: { type: String, required: true },
  platform: { type: String, required: true },
  values: { type: String, default: '[]' },
  userId: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

dailyMetricSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
dailyMetricSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('DailyMetric', dailyMetricSchema)
