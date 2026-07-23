import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'todo' },
  priority: { type: String, default: 'medium' },
  progress: { type: Number, default: 0 },
  dueDate: { type: String },
  timeStart: { type: String },
  timeEnd: { type: String },
  assignee: { type: String },
  createdBy: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
})

taskSchema.set('toJSON', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })
taskSchema.set('toObject', { virtuals: false, versionKey: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret } })

export default mongoose.model('Task', taskSchema)
