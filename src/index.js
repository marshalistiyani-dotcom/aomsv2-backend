import 'express-async-errors'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/database.js'
import { seedDatabase } from './seed.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import eventRoutes from './routes/events.js'
import kpiRoutes from './routes/kpi.js'
import reportRoutes from './routes/reports.js'
import userRoutes from './routes/users.js'

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
app.use('/api/users', userRoutes)

app.use(errorHandler)

await connectDB()
await seedDatabase()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
