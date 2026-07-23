import 'dotenv/config'
import mongoose from 'mongoose'

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aoms'

async function explore() {
  await mongoose.connect(URI)
  const db = mongoose.connection.db

  const collections = await db.listCollections().toArray()
  console.log('Collections:', collections.map(c => c.name))

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments()
    const sample = await db.collection(c.name).find().limit(2).toArray()
    console.log(`\n${c.name} (${count} docs)`)
    console.log('  Sample:', JSON.stringify(sample[0], null, 2))
  }

  await mongoose.disconnect()
}

explore().catch(console.error)
