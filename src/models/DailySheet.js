import mongoose from 'mongoose'

const sheetItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timeStart: { type: String, default: '' },
  timeEnd: { type: String, default: '' },
  work: { type: String, default: '' },
  keterangan: { type: String, default: '' },
  targetLeads: { type: Number, default: 0 },
  actualTimeStart: { type: String, default: '' },
  actualTimeEnd: { type: String, default: '' },
  leadsObtained: { type: Number, default: 0 },
}, { _id: false })

const dailySheetSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  date: { type: String, required: true },
  userId: { type: String, required: true },
  createdBy: { type: String },
  status: { type: String, default: 'draft' },
  items: { type: [sheetItemSchema], default: [] },
  notes: { type: String, default: '' },
  followedUp: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

dailySheetSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
dailySheetSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('DailySheet', dailySheetSchema)
