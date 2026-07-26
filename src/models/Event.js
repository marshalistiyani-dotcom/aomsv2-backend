import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String },
  time: { type: String },
  location: { type: String, default: '' },
  pic: { type: String },
  status: { type: String, default: 'upcoming' },
  createdBy: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  report: {
    totalParticipants: { type: Number, default: null },
    notes: { type: String, default: '' },
    createdAt: { type: String, default: null },
  },
})

eventSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
eventSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('Event', eventSchema)
