import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set in .env')
    process.exit(1)
  }
  const safeUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//<user>:<password>@')
  let attempt = 0
  for (;;) {
    attempt += 1
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
      console.log('MongoDB connected:', safeUri)
      return mongoose.connection
    } catch (err) {
      console.error(`[MongoDB] attempt ${attempt} failed (${new Date().toISOString()}): ${err.message}`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
  console.log('MongoDB disconnected')
}

export function getDb() {
  return mongoose.connection
}
