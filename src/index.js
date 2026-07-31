import 'express-async-errors'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import os from 'os'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { connectDB } from './config/database.js'
import { seedDatabase } from './seed.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import eventRoutes from './routes/events.js'
import kpiRoutes from './routes/kpi.js'
import reportRoutes from './routes/reports.js'
import metricRoutes from './routes/metrics.js'
import dailyMetricRoutes from './routes/dailyMetrics.js'
import leadEntryRoutes from './routes/leadEntries.js'
import userRoutes from './routes/users.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/kpi', kpiRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/metrics', metricRoutes)
app.use('/api/daily-metrics', dailyMetricRoutes)
app.use('/api/leads', leadEntryRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState
  res.json({
    status: ready === 1 ? 'ok' : 'degraded',
    mongo: ready === 1 ? 'connected' : 'disconnected',
    db: ready,
    timestamp: new Date().toISOString(),
  })
})

  const frontendDist = path.join(__dirname, '../public')
app.use(express.static(frontendDist))
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.use(errorHandler)

connectDB()
  .then(() => seedDatabase())
  .catch((err) => {
    console.error('Startup error:', err)
  })

app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces()
  const ip = Object.values(nets).flat().find(n => n.family === 'IPv4' && !n.internal)?.address || 'localhost'
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`External: http://${ip}:${PORT}`)
})
