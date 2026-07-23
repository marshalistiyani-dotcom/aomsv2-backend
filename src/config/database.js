import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set in .env')
    process.exit(1)
  }
  await mongoose.connect(uri)
  console.log('MongoDB connected:', uri.replace(/\/\/[^:]+:[^@]+@/, '//<user>:<password>@'))
  return mongoose.connection
}

export async function disconnectDB() {
  await mongoose.disconnect()
  console.log('MongoDB disconnected')
}

export function getDb() {
  return mongoose.connection
}
